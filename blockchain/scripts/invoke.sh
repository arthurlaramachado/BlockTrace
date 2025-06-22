#!/usr/bin/env bash

. ./envVar.sh
. ./utils.sh

ROOTDIR=$(cd "$(dirname "$0")" && pwd)
export PATH=${ROOTDIR}/../bin:${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${ROOTDIR}/../config

COMMAND=$1

setGlobals 1

CA_FILE="--cafile ${ROOTDIR}/../organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" 

if [ "$1" = "InitLedger" ]; then
    peer chaincode invoke \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --tls \
    --cafile "${ROOTDIR}/../organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
    -C main \
    -n dpps-management-chaincode \
    --peerAddresses localhost:7051 \
    --peerAddresses localhost:9051 \
    --tlsRootCertFiles "${ROOTDIR}/../organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
    --tlsRootCertFiles "${ROOTDIR}/../organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
    -c '{"function":"InitLedger", "Args":[]}'
elif [ "$1" = "QueryAll" ]; then
    peer chaincode query \
        -o localhost:7050 \
        -C main \
        -n dpps-management-chaincode \
        --peerAddresses localhost:7051 \
        --tlsRootCertFiles "${ROOTDIR}/../organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
        -c '{"function":"GetAllDPPs", "Args":[]}' | jq
else
    warnln "$1 is not a valid command to chaincode"
fi