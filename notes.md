================================================
Cluster
================================================
- Namespaces - for now skip, add via helm hooks only when specific namespace annotations/labels are required
- Priority classes - add at the end, go through all apps

================================================
Argo CD deployment from here
================================================
- Metallb - CRD update diff ignore list
- Argocd - move ingress to ansible?
- Homepage - Config TBA
- External DNS
    - Put the instances on separate nodes when possible



- Cypress tests


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