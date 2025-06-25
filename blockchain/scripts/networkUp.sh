#!/bin/bash
#
# Copyright IBM Corp. and Hyperledger Fabric contributors
# Adapted by Arthur de Lara Machado
#
# SPDX-License-Identifier: Apache-2.0
#

# Notes:
# The actual version of the projects uses cryptogen, which is a tool that is
# meant for development and testing that can quickly create the certificates and keys

# Todo:
# Allow for Fabric CAs
# Fix networkUp fail when flag --restart -> possibly not cleaning everything correctly??

# ensures absolute path doesnt matter where script is called from
ROOTDIR=$(cd "$(dirname "$0")" && pwd)
export PATH=${ROOTDIR}/../bin:${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${ROOTDIR}/../configtx

# push to the required directory & set a trap to go back if needed
pushd ${ROOTDIR} > /dev/null
trap "popd > /dev/null" EXIT

. ./utils.sh
. ./registerEnroll.sh

## VARIABLES
CONTAINER_CLI="docker"
CONTAINER_CLI_COMPOSE="${CONTAINER_CLI} compose"
COMPOSE_FILE_BASE=compose-net.yaml
COMPOSE_FILE_COUCH=compose-couch.yaml
COMPOSE_FILE_CA=compose-ca.yaml
# Get docker sock path from environment variable
SOCK="${DOCKER_HOST:-/var/run/docker.sock}"
DOCKER_SOCK="${SOCK##unix://}"

function createOrgs() {
    if test -d "${ROOTDIR}/../organizations/peerOrganizations"; then
        infoln "🗑️  Removing older peers and orgs..."
        rm -Rf "${ROOTDIR}/../organizations/peerOrganizations" && rm -Rf "${ROOTDIR}/../organizations/ordererOrganizations" && rm -Rf "${ROOTDIR}/../organizations/fabric-ca"
    fi

    infoln "🔐 Generating certificates using Fabric CA"
    ${CONTAINER_CLI_COMPOSE} -f ${ROOTDIR}/../compose/$COMPOSE_FILE_CA -f ${ROOTDIR}/../compose/$CONTAINER_CLI/${CONTAINER_CLI}-$COMPOSE_FILE_CA up -d 2>&1

    # Make sure CA files have been created
    while :
    do
      if [ ! -f "${ROOTDIR}/../organizations/fabric-ca/org1/tls-cert.pem" ]; then
        sleep 1
      else
        break
      fi
    done

    # Make sure CA service is initialized and can accept requests before making register and enroll calls
    export FABRIC_CA_CLIENT_HOME=${ROOTDIR}/../organizations/peerOrganizations/org1.example.com/
    COUNTER=0
    rc=1
    while [[ $rc -ne 0 && $COUNTER -lt $MAX_RETRY ]]; do
      sleep 1
      set -x
      fabric-ca-client getcainfo -u https://admin:adminpw@localhost:7054 --caname ca-org1 --tls.certfiles "${ROOTDIR}/../organizations/fabric-ca/org1/ca-cert.pem"
      res=$?
    { set +x; } 2>/dev/null
    rc=$res  # Update rc
    COUNTER=$((COUNTER + 1))
    done

    echo ""
    infoln "🏗️  Creating Org1 Identities"
    createOrg1
    successln "Org1 successfully created!"

    echo ""
    infoln "🏗️  Creating Org2 Identities"
    createOrg2
    successln "Org1 successfully created!"

    echo ""
    infoln "🏗️  Creating Orderer Org Identities"
    createOrderer
    successln "Orderer successfully created!"

    echo ""
    infoln "🏗️  Generating Connection Profile (CPP) files for Org1 and Org2"
    ./ccp-generate.sh
    successln "CPP successfully created"
}

## Check for fabric-ca
function checkCA() {
  infoln "Looking for Fabric CA Client..."

  fabric-ca-client version > /dev/null 2>&1
  if [[ $? -ne 0 ]]; then
    fatalln "fabric-ca-client binary not found..\n\n
      Follow the instructions in the Fabric docs to install the Fabric Binaries:\n
      https://hyperledger-fabric.readthedocs.io/en/latest/install.html
    "
  fi
  # Download image of fabric-ca-client
  CA_LOCAL_VERSION=$(fabric-ca-client version | sed -ne 's/ Version: //p')
  CA_DOCKER_IMAGE_VERSION=$(${CONTAINER_CLI} run --rm hyperledger/fabric-ca:latest fabric-ca-client version | sed -ne 's/ Version: //p' | head -1)
  infoln "CA_LOCAL_VERSION=$CA_LOCAL_VERSION"
  infoln "CA_DOCKER_IMAGE_VERSION=$CA_DOCKER_IMAGE_VERSION"

  if [ "$CA_LOCAL_VERSION" != "$CA_DOCKER_IMAGE_VERSION" ]; then
    warnln "Local fabric-ca binaries and docker images are out of sync. This may cause problems."
  fi
}

function networkUp() {
  checkDockerAndCompose
  checkCA

  createOrgs
  # generate artifacts if they don't exist
  #if [ ! -d "${ROOTDIR}/../organizations/peerOrganizations" ]; then
  #fi

  # Get list of container IDs BEFORE
  containers_before=$(docker ps -aq)

  echo ""
  infoln "🐳 Initializing docker containers"
  COMPOSE_BASE_FILES="-f ${ROOTDIR}/../compose/${COMPOSE_FILE_BASE} -f ${ROOTDIR}/../compose/${CONTAINER_CLI}/${CONTAINER_CLI}-${COMPOSE_FILE_BASE}"
  COMPOSE_COUCH_FILES="-f ${ROOTDIR}/../compose/${COMPOSE_FILE_COUCH} -f ${ROOTDIR}/../compose/${CONTAINER_CLI}/${CONTAINER_CLI}-${COMPOSE_FILE_COUCH}"
  COMPOSE_FILES="${COMPOSE_BASE_FILES} ${COMPOSE_COUCH_FILES}"

  DOCKER_SOCK="${DOCKER_SOCK}" ${CONTAINER_CLI_COMPOSE} ${COMPOSE_FILES} up -d 2>&1
  
  if [ $? -ne 0 ]; then
    fatalln "Unable to start network"
  fi

  # Get list of container IDs AFTER
  containers_after=$(docker ps -aq)

  saveNewContainerIds "$containers_before" "$containers_after" $ROOTDIR

  $CONTAINER_CLI ps -a

  echo ""
  infoln "🚀 Containers successfully launched"
  successln "Network successfully initialized!"
}

function checkAllContainersRunning() {
  local container_ids
  container_ids=$(< "${ROOTDIR}/container_ids.txt")

  local all_running=true

  echo ""
  while read -r id; do
    local status
    status=$($CONTAINER_CLI inspect -f '{{.State.Status}}' "$id" 2>/dev/null)

    infoln "Testing container $id..."
    if [ "$status" != "running" ]; then
      errorln "Container $id is NOT running (status: $status)\n"
      all_running=false
    else
      successln "Container $id is running\n"
    fi
  done <<< "$container_ids"

  if [ "$all_running" = true ]; then
    return 0
  else
    return 1
  fi
}

function isNetworkUp {
  if checkAllContainersRunning; then
    successln "All containers are running!\n"
    return 0
  else
    fatalln "Some containers are not running.\n"
    return 1
  fi
}

function createChannel {
  isNetworkUp
  networkState=$?

  if [ ! $networkState ]; then
    fatalln "Network is down, plese run the network first!"
  fi

  if [[ $networkState -eq 0 ]] && [[ ! -d "${ROOTDIR}/../organizations/peerOrganizations" ]]; then
    warnln "🔁 Restarting network to sync certs..."
    networkDown
  else
    successln "Network running and certs synced!\n" 
  fi

  infoln "⏳ Waiting for 5 seconds for containers to fully initialize..."
  sleep 5

  #Runs the script that creates a Channel
  ./createChannel.sh
}

if [ -z "$1" ]; then
  :
elif [ "$1" = "--restart" ]; then
  # Resets network
  ./networkDown.sh
else
  fatalln "Invalid flag '$1'. Check the documentation for available flags."
fi

networkUp
createChannel