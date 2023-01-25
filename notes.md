================================================
Cluster
================================================
- Namespaces - for now skip, add via helm hooks only when specific namespace annotations/labels are required
- Priority classes - add at the end, go through all apps

================================================
Argo CD deployment from here
================================================
- Metallb - CRD ignore list
* Pomerium (CRD)
    - Network policy for Pomerium
        - Ingress
            - Kubernetes API
        - Egress
            - DNS
            - Kubernetes API
            - Internet (i.e. no local networks)
            - Any pod in any namespace
- Homepage (use as a test case for Pomerium etc.)
    - Live + Ready checks (check the root page itself)
    - Config map




- Prometheus stack (many CRDs)
- Node monitoring
- Grafana configuration
- Node problem detector
- Kubescape

================================================
Apps
================================================
- External DNS !!!
- Frigate
- ...