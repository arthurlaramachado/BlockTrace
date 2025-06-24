#!/bin/bash
#
# Copyright IBM Corp. and Hyperledger Fabric contributors
# Adapted by Arthur de Lara Machado
#
# SPDX-License-Identifier: Apache-2.0
#

# Imports
. ./utils.sh

# Variables
ROOTDIR=$(cd "$(dirname "$0")" && pwd)
## VARIABLES
CONTAINER_CLI="docker"
CONTAINER_CLI_COMPOSE="${CONTAINER_CLI} compose"
COMPOSE_FILE_BASE=compose-net.yaml
COMPOSE_FILE_COUCH=compose-couch.yaml
# Get docker sock path from environment variable
SOCK="${DOCKER_HOST:-/var/run/docker.sock}"
DOCKER_SOCK="${SOCK##unix://}"

# push to the required directory & set a trap to go back if needed
pushd ${ROOTDIR} > /dev/null
trap "popd > /dev/null" EXIT

# Obtain CONTAINER_IDS and remove them
# This function is called when you bring a network down
function clearContainers() {
  infoln "🧹 Removing remaining containers"
  ${CONTAINER_CLI} rm -f $(${CONTAINER_CLI} ps -aq --filter label=service=hyperledger-fabric) 2>/dev/null || true
  ${CONTAINER_CLI} rm -f $(${CONTAINER_CLI} ps -aq --filter name='dev-peer*') 2>/dev/null || true
  ${CONTAINER_CLI} kill "$(${CONTAINER_CLI} ps -q --filter name=ccaas)" 2>/dev/null || true
  removeSavedContainers $CONTAINER_CLI
}

function removeUnwantedImages() {
  infoln "🧹 Removing generated chaincode docker images"
  ${CONTAINER_CLI} image rm -f $(${CONTAINER_CLI} images -aq --filter reference='dev-peer*') 2>/dev/null || true
  successln "Successfully removed chaincode images!\n"
}

# Tear down running network
function networkDown() {
  local temp_compose=$COMPOSE_FILE_BASE

  # CouchDB and CA Files are yet to be implemented
  COMPOSE_BASE_FILES="-f ${ROOTDIR}/../compose/${COMPOSE_FILE_BASE} -f ${ROOTDIR}/../compose/${CONTAINER_CLI}/${CONTAINER_CLI}-${COMPOSE_FILE_BASE}"
  COMPOSE_COUCH_FILES="-f ${ROOTDIR}/../compose/${COMPOSE_FILE_COUCH} -f ${ROOTDIR}/../compose/${CONTAINER_CLI}/${CONTAINER_CLI}-${COMPOSE_FILE_COUCH}"
  COMPOSE_CA_FILES="-f ${ROOTDIR}/../compose/${COMPOSE_FILE_CA} -f ${ROOTDIR}/../compose/${CONTAINER_CLI}/${CONTAINER_CLI}-${COMPOSE_FILE_CA}"
  COMPOSE_FILES="${COMPOSE_BASE_FILES} ${COMPOSE_COUCH_FILES} ${COMPOSE_CA_FILES}"

  DOCKER_SOCK=$DOCKER_SOCK ${CONTAINER_CLI_COMPOSE} ${COMPOSE_FILES} down --volumes --remove-orphans

  COMPOSE_FILE_BASE=$temp_compose

  #Cleanup the chaincode containers
  clearContainers
  #Cleanup images
  removeUnwantedImages

  # Don't remove the generated artifacts -- note, the ledgers are always removed
  # Bring down the network, deleting the volumes
  ${CONTAINER_CLI} volume rm compose_orderer.example.com
  ${CONTAINER_CLI} volume rm compose_peer0.org1.example.com
  ${CONTAINER_CLI} volume rm compose_peer0.org2.example.com

  # remove orderer block and other channel configuration transactions and certs
  ${CONTAINER_CLI} run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf '"${ROOTDIR}"'/../artifacts/*.block '"${ROOTDIR}"'/../organizations/peerOrganizations '"${ROOTDIR}"'/../organizations/ordererOrganizations'
  ## remove fabric ca artifacts
  ${CONTAINER_CLI} run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf '"${ROOTDIR}"'/../organizations/fabric-ca/org1/msp '"${ROOTDIR}"'/../organizations/fabric-ca/org1/tls-cert.pem '"${ROOTDIR}"'/../organizations/fabric-ca/org1/ca-cert.pem organizations/fabric-ca/org1/IssuerPublicKey '"${ROOTDIR}"'/../organizations/fabric-ca/org1/IssuerRevocationPublicKey '"${ROOTDIR}"'/../organizations/fabric-ca/org1/fabric-ca-server.db'
  ${CONTAINER_CLI} run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf '"${ROOTDIR}"'/../organizations/fabric-ca/org2/msp '"${ROOTDIR}"'/../organizations/fabric-ca/org2/tls-cert.pem '"${ROOTDIR}"'/../organizations/fabric-ca/org2/ca-cert.pem organizations/fabric-ca/org2/IssuerPublicKey '"${ROOTDIR}"'/../organizations/fabric-ca/org2/IssuerRevocationPublicKey '"${ROOTDIR}"'/../organizations/fabric-ca/org2/fabric-ca-server.db'
  ${CONTAINER_CLI} run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf '"${ROOTDIR}"'/../organizations/fabric-ca/ordererOrg/msp '"${ROOTDIR}"'/../organizations/fabric-ca/ordererOrg/tls-cert.pem '"${ROOTDIR}"'/../organizations/fabric-ca/ordererOrg/ca-cert.pem '"${ROOTDIR}"'/../organizations/fabric-ca/ordererOrg/IssuerPublicKey '"${ROOTDIR}"'/../organizations/fabric-ca/ordererOrg/IssuerRevocationPublicKey '"${ROOTDIR}"'/../organizations/fabric-ca/ordererOrg/fabric-ca-server.db'
  # remove channel and script artifacts
  ${CONTAINER_CLI} run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf '"${ROOTDIR}"'/../artifacts log.txt *.tar.gz'
  ${CONTAINER_CLI} run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf '"${ROOTDIR}"' log.txt *.tar.gz'
  
  successln "Network is now down!"
}

networkDown
