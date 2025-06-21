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
# Implement CouchDB
# Add function to add container ids of chaincodes to the container_ids.txt file

# ensures absolute path doesnt matter where script is called from
ROOTDIR=$(cd "$(dirname "$0")" && pwd)
export PATH=${ROOTDIR}/../bin:${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${ROOTDIR}/../configtx

# push to the required directory & set a trap to go back if needed
pushd ${ROOTDIR} > /dev/null
trap "popd > /dev/null" EXIT

. ./utils.sh

## VARIABLES
CONTAINER_CLI="docker"
CONTAINER_CLI_COMPOSE="${CONTAINER_CLI} compose"
COMPOSE_FILE_BASE=compose-net.yaml
# Get docker sock path from environment variable
SOCK="${DOCKER_HOST:-/var/run/docker.sock}"
DOCKER_SOCK="${SOCK##unix://}"

function createOrgs() {
    if test -d "${ROOTDIR}/../organizations/peerOrganizations"; then
        infoln "🗑️  Removing older peers and orgs..."
        rm -Rf "${ROOTDIR}/../organizations/peerOrganizations" && rm -Rf "${ROOTDIR}/../organizations/ordererOrganizations"
    fi

    # Create crypto material using cryptogen
    which cryptogen # checks $PATH for cryptogen bin
    if [ "$?" -ne 0 ]; then # "$?" is a variable containing the return of the last command, if not equal 0 (-ne 0) triggers error
      fatalln "cryptogen tool not found. exiting"
    fi
    infoln "🔐 Generating certificates using cryptogen tool"

    echo ""
    infoln "🏗️  Creating Org1 Identities"

    set -x
    cryptogen generate --config="${ROOTDIR}/../organizations/cryptogen/crypto-config-org1.yaml" --output="${ROOTDIR}/../organizations"
    res=$?
    { set +x; } 2>/dev/null
    if [ $res -ne 0 ]; then
      fatalln "Failed to generate certificates..."
    fi

    successln "Org1 successfully created!"

    echo ""
    infoln "🏗️  Creating Org2 Identities"

    set -x
    cryptogen generate --config="${ROOTDIR}/../organizations/cryptogen/crypto-config-org2.yaml" --output="${ROOTDIR}/../organizations"
    res=$?
    { set +x; } 2>/dev/null
    if [ $res -ne 0 ]; then
      fatalln "Failed to generate certificates..."
    fi

    successln "Org1 successfully created!"

    echo ""
    infoln "🏗️  Creating Orderer Org Identities"

    set -x
    cryptogen generate --config="${ROOTDIR}/../organizations/cryptogen/crypto-config-orderer.yaml" --output="${ROOTDIR}/../organizations"
    res=$?
    { set +x; } 2>/dev/null
    if [ $res -ne 0 ]; then
      fatalln "Failed to generate certificates..."
    fi

    successln "Orderer successfully created!"

    echo ""
    infoln "🏗️  Generating Connection Profile (CPP) files for Org1 and Org2"
    ./ccp-generate.sh
    successln "CPP successfully created"
}

function networkUp() {
  checkDockerAndCompose

  # generate artifacts if they don't exist
  if [ ! -d "${ROOTDIR}/../organizations/peerOrganizations" ]; then
    createOrgs
  fi

  # Get list of container IDs BEFORE
  containers_before=$(docker ps -aq)

  echo ""
  infoln "🐳 Initializing docker containers"
  #Executes the command to create containers based on compose-net.yaml instructions
  COMPOSE_FILES="-f ${ROOTDIR}/../compose/${COMPOSE_FILE_BASE} -f ${ROOTDIR}/../compose/${CONTAINER_CLI}/${CONTAINER_CLI}-${COMPOSE_FILE_BASE}"
  DOCKER_SOCK="${DOCKER_SOCK}" ${CONTAINER_CLI_COMPOSE} ${COMPOSE_FILES} up -d 2>&1
  
  if [ $? -ne 0 ]; then
    fatalln "Unable to start network"
  fi

  # Get list of container IDs AFTER
  containers_after=$(docker ps -aq)

  saveNewContainerIds "$containers_before" "$containers_after" $ROOTDIR

  #if [ "${DATABASE}" == "couchdb" ]; then
  #  COMPOSE_FILES="${COMPOSE_FILES} -f compose/${COMPOSE_FILE_COUCH} -f compose/${CONTAINER_CLI}/${CONTAINER_CLI}-${COMPOSE_FILE_COUCH}"
  #fi

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