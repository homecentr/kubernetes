#!/usr/bin/env bash

set -e

ENVIRONMENT=$1

# Decrypt keys with GPG (yubikey)
AGE_KEYS=$(gpg --batch --use-agent --decrypt ./.keys/$ENVIRONMENT.gpg)

# Parse the age keys
export SOPS_AGE_RECIPIENTS=$(echo "$AGE_KEYS" | grep public | awk -F': ' '{print $2}')
export SOPS_AGE_KEY=$(echo "$AGE_KEYS" | grep -v "#")