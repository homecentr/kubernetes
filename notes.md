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
- Homepage
    
    - Live + Ready checks (check the root page itself) if the chart does not contain them already
    - Test auto discovery/configuration




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