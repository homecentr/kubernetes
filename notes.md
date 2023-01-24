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
    - TODO: Replica storage -> Use postgres in Pomerium CR
    - TODO: Network policy for Postgres and Pomerium
    - TODO: Switch to app created by terraform (when the re-deployed app works)
    - TODO: Labels
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