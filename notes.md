================================================
Cluster
================================================
- Namespaces - for now skip, add via helm hooks only when specific namespace annotations/labels are required
- Priority classes - add at the end, go through all apps

================================================
Argo CD deployment from here
================================================
+ Ingress (traefik, CRD) - will this be needed if we have pomerium ???
* Pomerium (CRD)
    - TODO: Labels
    - TODO: HA storage - Postgres !!!
    - TODO: Switch to app created by terraform
- Homepage (use as a test case for Pomerium etc.)
    - Live + Ready checks
    - Config map
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