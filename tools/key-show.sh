#!/usr/bin/env bash

set -e

. ./tools/key-parse.sh $1

echo "Public key"
echo "--------------------------------------------------"
echo "Raw:    $SOPS_AGE_RECIPIENTS"
echo "Base64: $(echo $SOPS_AGE_RECIPIENTS | base64)"
echo ""
echo "Private key"
echo "--------------------------------------------------"
echo "Raw:    $SOPS_AGE_KEY"
echo "Base64: $(echo $SOPS_AGE_KEY | base64)"