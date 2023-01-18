- Update kubernetes repository to use pgp directly
    - Add .sops.yaml config (?)
    - Update github secret - use pgp key
    + Add helm_secrets plugin installation to yarn scripts
    - Define per environment recipients list, each environment will have
        - Developer (same for all envs) - stored only in Yubikey
        - GitHub (same for all envs) - stored only in GitHub
        - Cluster (different for each env) - stored in cluster and ansible secrets
    - Update scripts
        - key-generate - can be removed
        - key-parse - can be removed
        - key-show - can be removed
        - secrets-edit - to use age directly -> if possible switch to node script
            - !!! WAIT SOPS uses env vars !!! dumping the identity might not be neccessary !!!
            - Call yubikey plugin to dump the identity into a temp file (ignored by git), it does not contain any secret
            - Call age with the dumped identity file
    - Update readme.md
    - Update CI workflow
        - generate a new key for github
        - install helm_secrets via yarn scripts
        - create identity file from a secret
        - !!! WAIT SOPS uses env vars !!!


- Cert manager chart





================================================
Cluster
================================================
- Priority classes (?)

================================================
Argo CD deployment from here
================================================
- Cert manager
- Ingress (traefik)
- Homepage (use as a test case for Pomerium etc.)
- Storage
- Prometheus stack
- Node monitoring
- Grafana configuration
- Pomerium
- Node problem detector
- Kubescape

================================================
Apps
================================================
- Frigate
- External DNS
- ...