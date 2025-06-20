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

ROOTDIR=$(cd "$(dirname "$0")" && pwd)
BLOCKFILE="${ROOTDIR}/../artifacts/${CHANNEL_NAME}.block"

infoln "🛰️	Starting Channel Creation\n"

checkDockerAndCompose

if [ ! -d "$ROOTDIR/../artifacts" ]; then
	mkdir $ROOTDIR/../artifacts
fi

function createChannelGenesisBlock {
    echo ""
    infoln "🧱 Creating genesis block!"

    setGlobals 1 --verbose

    export FABRIC_CFG_PATH="${ROOTDIR}/../configtx/"

    which configtxgen
	if [ "$?" -ne 0 ]; then
		fatalln "configtxgen tool not found."
	fi

    echo ""
    infoln "⚙️  Running configtxgen and showing logs"
    set -x
	configtxgen -profile ChannelUsingRaft -outputBlock ${ROOTDIR}/../artifacts/${CHANNEL_NAME}.block -channelID $CHANNEL_NAME
	res=$?
	{ set +x; } 2>/dev/null

    verifyResult $res "Failed to generate channel configuration transaction..."
}

function createChannel {
    local rc=1
	local COUNTER=1

	infoln "🔗 Creating channel and adding orderers..."
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
		sleep $DELAY
		set -x

    . ./orderer.sh ${CHANNEL_NAME}> /dev/null 2>&1
		res=$?

		{ set +x; } 2>/dev/null
		rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done

    cat log.txt # Shows log created by the orderer.sh script
	verifyResult $res "Channel creation failed"
    successln "Channel '$CHANNEL_NAME' created successfully"
}

joinChannel() {
    ORG=$1
    FABRIC_CFG_PATH="${ROOTDIR}/../config/"
    setGlobals $ORG
	local rc=1
	local COUNTER=1

    echo ""
    infoln "🏛️  + 🔗 $ORG joining channel '$CHANNEL_NAME'..."

	## Sometimes Join takes time, hence retry
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
        sleep $DELAY
        set -x

        peer channel join -b $BLOCKFILE >&log.txt
        res=$?

        { set +x; } 2>/dev/null
		rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done

	cat log.txt
	verifyResult $res "After $MAX_RETRY attempts, peer0.org${ORG} has failed to join channel '$CHANNEL_NAME' "
    successln "peer0.org${ORG} has successfully joined channel '$CHANNEL_NAME' "
}

setAnchorPeer() {
  ORG=$1

  echo ""
  infoln "⚓ Setting anchor peer for $ORG..."
  . ./setAnchorPeer.sh $ORG $CHANNEL_NAME 
  successln "Anchor peer successfully set!\n"
}

# Create genesis block
createChannelGenesisBlock

# Create channel
createChannel

# Join all the peers to the channel
joinChannel 1
joinChannel 2

# Set the anchor peers for each org in the channel
setAnchorPeer 1
setAnchorPeer 2

successln "Channel '$CHANNEL_NAME' joined"