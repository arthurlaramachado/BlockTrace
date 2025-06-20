#!/usr/bin/env bash
#
# Copyright IBM Corp. and Hyperledger Fabric contributors
# Adapted by Arthur de Lara Machado
#
# SPDX-License-Identifier: Apache-2.0
#

# This is a collection of bash functions used by different scripts

. ./utils.sh

ROOTDIR=$(cd "$(dirname "$0")" && pwd)

export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${ROOTDIR}/../organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem
export PEER0_ORG1_CA=${ROOTDIR}/../organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem
export PEER0_ORG2_CA=${ROOTDIR}/../organizations/peerOrganizations/org2.example.com/tlsca/tlsca.org2.example.com-cert.pem

# Set environment variables for the peer org
# Can be called like "setGlobals 1" or "setGlobals 2"
setGlobals() {
  local USING_ORG=""

  if [ -n "$1" ]; then
    USING_ORG=$1
  else
    fatalln "Internal error: organization not specified"
  fi

  echo ""
  infoln "🏛️  Using organization ${USING_ORG}"

  if [ $USING_ORG -eq 1 ]; then
    export CORE_PEER_LOCALMSPID=Org1MSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA
    export CORE_PEER_MSPCONFIGPATH=${ROOTDIR}/../organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
  elif [ $USING_ORG -eq 2 ]; then
    export CORE_PEER_LOCALMSPID=Org2MSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG2_CA
    export CORE_PEER_MSPCONFIGPATH=${ROOTDIR}/../organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
  else
    errorln "ORG Unknown"
  fi

  if [ -n "$2" ]; then
    if [ "$2" = "--verbose" ]; then
      env | grep CORE
    else
      warnln "'$2' is not a valid command. Try '--verbose' instead."
    fi
  fi
}

# parsePeerConnectionParameters $@
# Helper function that sets the peer connection parameters for a chaincode
# operation
parsePeerConnectionParameters() {
  PEER_CONN_PARMS=()
  PEERS=""
  while [ "$#" -gt 0 ]; do
    setGlobals $1
    PEER="peer0.org$1"
    ## Set peer addresses
    if [ -z "$PEERS" ]
    then
	PEERS="$PEER"
    else
	PEERS="$PEERS $PEER"
    fi
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" --peerAddresses $CORE_PEER_ADDRESS)
    ## Set path to TLS certificate
    CA=PEER0_ORG$1_CA
    TLSINFO=(--tlsRootCertFiles "${!CA}")
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" "${TLSINFO[@]}")
    # shift by one to get to the next organization
    shift
  done
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    fatalln "$2"
  fi
}
