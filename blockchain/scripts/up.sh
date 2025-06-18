#!/bin/bash

# Notes:
# The actual version of the projects uses cryptogen, which is a tool that is
# meant for development and testing that can quickly create the certificates and keys

# Todo:
# Allow for Fabric CAs
# Implement CouchDB

# ensures absolute path doesnt matter where script is called from
ROOTDIR=$(cd "$(dirname "$0")" && pwd)
export PATH=${ROOTDIR}/../bin:${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${ROOTDIR}/configtx

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

function checkDockerAndCompose {
    infoln "🔍 Checking Docker installation..."

    if ! command -v docker &> /dev/null; then
        fatalln "Docker is not installed or not in PATH."
    fi

    infoln "🔍 Checking Docker Compose installation..."

    if ! docker compose version &> /dev/null; then
        if ! docker-compose version &> /dev/null; then
            fatalln "No version of Docker Compose found."
        else
            fatalln "⚠️ Legacy Docker Compose is installed, but it's not supported by this script."
        fi
    fi

    successln "Docker is correctly installed. Moving forward..."
}

# Obtain CONTAINER_IDS and remove them
# This function is called when you bring a network down
function clearContainers() {
  infoln "🧹 Removing remaining containers"
  ${CONTAINER_CLI} rm -f $(${CONTAINER_CLI} ps -aq --filter label=service=hyperledger-fabric) 2>/dev/null || true
  ${CONTAINER_CLI} rm -f $(${CONTAINER_CLI} ps -aq --filter name='dev-peer*') 2>/dev/null || true
  ${CONTAINER_CLI} kill "$(${CONTAINER_CLI} ps -q --filter name=ccaas)" 2>/dev/null || true
}

function removeUnwantedImages() {
    infoln "🧹 Removing generated chaincode docker images"
    ${CONTAINER_CLI} image rm -f $(${CONTAINER_CLI} images -aq --filter reference='dev-peer*') 2>/dev/null || true
}

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

  echo ""
  infoln "🐳 Initializing docker containers"
  #Executes the command to create containers based on compose-net.yaml instructions
  COMPOSE_FILES="-f ${ROOTDIR}/../compose/${COMPOSE_FILE_BASE} -f ${ROOTDIR}/../compose/${CONTAINER_CLI}/${CONTAINER_CLI}-${COMPOSE_FILE_BASE}"
  DOCKER_SOCK="${DOCKER_SOCK}" ${CONTAINER_CLI_COMPOSE} ${COMPOSE_FILES} up -d 2>&1
  
  if [ $? -ne 0 ]; then
    fatalln "Unable to start network"
  fi

  #if [ "${DATABASE}" == "couchdb" ]; then
  #  COMPOSE_FILES="${COMPOSE_FILES} -f compose/${COMPOSE_FILE_COUCH} -f compose/${CONTAINER_CLI}/${CONTAINER_CLI}-${COMPOSE_FILE_COUCH}"
  #fi

  $CONTAINER_CLI ps -a

  echo ""
  infoln "🚀 Containers successfully launched"
  successln "Network successfully initialized!"
}

networkUp