#!/usr/bin/env bash

set -e

# Validate inputs
case "$1" in
  lab)
  ;;
  prod)
  ;;
  *) # else
  echo "Usage: secrets-generate-keys.sh (lab|prod)"
  exit 1
  ;;
esac

ENVIRONMENT=$1

# Generate keys
AGE_KEYS=$(age-keygen)

# Encrypt keys with GPG (YubiKey)
echo "$AGE_KEYS" | gpg --armor --encrypt --always-trust --recipient 2D1D9C803F35BBC24014C3906601E1EB2454827F --output "./keys/$ENVIRONMENT.gpg"