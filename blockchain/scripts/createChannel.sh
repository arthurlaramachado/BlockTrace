#!/usr/bin/env bash
#
# Copyright IBM Corp. and Hyperledger Fabric contributors
# Adapted by Arthur de Lara Machado
#
# SPDX-License-Identifier: Apache-2.0
#

# imports  
. ./envVar.sh
. ./utils.sh

CHANNEL_NAME="$1"
DELAY="$2"
MAX_RETRY="$3"
VERBOSE="$4"
CONTAINER_CLI="$5"
: ${CHANNEL_NAME:="main"}
: ${DELAY:="3"}
: ${MAX_RETRY:="5"}
: ${VERBOSE:="false"}
: ${CONTAINER_CLI:="docker"}

getRootDir
ROOTDIR=$?

infoln "🛰️	Starting Channel Creation\n"

checkDockerAndCompose

if [ ! -d "$ROOTDIR/../artifacts" ]; then
	mkdir $ROOTDIR/../artifacts
fi

createChannelGenesisBlock {

}

