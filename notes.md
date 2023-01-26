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
    - Network policy
    - Figure static records (e.g. PVE multi answer)
    - Labels
    - Fix RBAC




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