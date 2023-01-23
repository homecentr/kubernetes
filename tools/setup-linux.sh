curl -s https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" > /etc/apt/sources.list.d/helm-stable-debian.list

apt-get install -y apt-transport-https
apt-get update
apt-get install -y helm sops gpg

helm plugin install https://github.com/jkroepke/helm-secrets

gpg --import ./tools/keys/*.asc