#!/usr/bin/env bash

set -e

# Load the age key
. ./scripts/key-parse.sh $1

export EDITOR=nano

# Edit the secrets file
sops -i "$INIT_CWD/secrets-$1.yml"