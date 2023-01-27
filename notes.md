================================================
Cluster
================================================
- Namespaces - for now skip, add via helm hooks only when specific namespace annotations/labels are required
- Priority classes - add at the end, go through all apps

================================================
Argo CD deployment from here
================================================
- Metallb - CRD update diff ignore list

- Homepage - Config
    - Infrastructure
        - Argo CD
        - Azure AD
        - Backblaze B2
    - Bookmarks below
        - github/homecentr

- Proxmox ingress
    - Ingress with multiple backends (with health check, use the GET /api2/json/version API endpoint, still requires a token...)
    - Endpoints for external instances

- Unifi controller (needs storage)

- Frigate
- Prometheus stack (many CRDs)
- Node monitoring

================================ First release here

- Kubernetes dashboard
- Grafana configuration
- Node problem detector
- Kubescape
- Cypress tests