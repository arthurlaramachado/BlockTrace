#
# Copyright IBM Corp. and Hyperledger Fabric contributors
# Adapted by Arthur de Lara Machado
#
# SPDX-License-Identifier: Apache-2.0
#

C_RESET='\033[0m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_BLUE='\033[0;34m'
C_YELLOW='\033[1;33m'

# println echos string
function println() {
  echo -e "$1"
}

# errorln echos i red color
function errorln() {
  println "❌ ${C_RED}${1}${C_RESET}"
}

# successln echos in green color
function successln() {
  println "✅ ${C_GREEN}${1}${C_RESET}"
}

# infoln echos in blue color
function infoln() {
  println "${C_BLUE}${1}${C_RESET}"
}

# warnln echos in yellow color
function warnln() {
  println "${C_YELLOW}${1}${C_RESET}"
}

# fatalln echos in red color and exits with fail status
function fatalln() {
  errorln "$1"
  exit 1
}

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

export -f errorln
export -f successln
export -f infoln
export -f warnln
export -f checkDockerAndCompose