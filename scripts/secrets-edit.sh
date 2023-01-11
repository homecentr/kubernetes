#!/usr/bin/env bash

set -e

printHelp() {
  echo "Usage: secrets-edit.sh (lab|prod)"
}

ENVIRONMENT=$1
EDITOR=nano

# Decrypt keys with GPG (yubikey)
AGE_KEYS=$(gpg --batch --use-agent --decrypt ./.keys/$ENVIRONMENT.gpg)

# Parse the age keys
SOPS_AGE_RECIPIENTS=$(echo "$AGE_KEYS" | grep public | awk -F': ' '{print $2}')
SOPS_AGE_KEY=$(echo "$AGE_KEYS" | grep -v "#")

# Edit the secrets file
sops -i "$INIT_CWD/secrets-$1.yml"