#!/usr/bin/env bash

channel_name=$1

ROOTDIR=$(cd "$(dirname "$0")" && pwd)

export PATH=${ROOTDIR}/../bin:${PWD}/../bin:$PATH
export ORDERER_ADMIN_TLS_SIGN_CERT=${ROOTDIR}/../organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt /dev/null 2>&1
export ORDERER_ADMIN_TLS_PRIVATE_KEY=${ROOTDIR}/../organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.key /dev/null 2>&1

osnadmin channel join --channelID ${channel_name} --config-block ../artifacts/${channel_name}.block -o localhost:7053 --ca-file "$ORDERER_CA" --client-cert "$ORDERER_ADMIN_TLS_SIGN_CERT" --client-key "$ORDERER_ADMIN_TLS_PRIVATE_KEY" >> log.txt 2>&1