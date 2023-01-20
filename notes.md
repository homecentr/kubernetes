================================================
Cluster
================================================
- Namespaces - for now skip, add via helm hooks only when specific namespace annotations/labels are required
- Priority classes - add at the end, go through all apps

================================================
Argo CD deployment from here
================================================
+ Metallb
    - TODO: Split CRDs
+ Cert-manager
    - TODO: Split CRDs
+ Ingress (traefik, CRD) - will this be needed if we have pomerium ???
- Pomerium (CRD)
    - TODO: Split CRDs
    - Deploy via Directory(https://argo-cd.readthedocs.io/en/stable/user-guide/directory/) source? We still need variables for ip addresses...
- Homepage (use as a test case for Pomerium etc.)
    - Live + Ready checks
    - Config map
- Storage
- Prometheus stack (many CRDs)
- Node monitoring
- Grafana configuration
- Node problem detector
- Kubescape

================================================
Apps
================================================
- Frigate
- External DNS
- ...