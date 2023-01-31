# Roadmap

## v1 - make it work
- Globals
    - Add to application template
    - Add to js tooling
- Kubernetes dashboard
    - Network policy
- Prometheus
    - Set up storage - first define the storage within lab - new gfs volumes required
    - Stack installation
    - Network policy
- Frigate
- MQTT
- Unifi controller
- qBittorrent

## v2 - protect against regression
- Cypress tests

## v3 - make it monitored
- Loki (with SSO)
- Prometheus stack (CRDs in separate app)
- Prometheus configuration
    - create prometheus instance
    - expose prometheus via protected ingress route
    - expose Grafana with SSO
    - monitor physical nodes
    - gluster monitoring

note: app naming convention for monitoring only apps monitoring-<area>, e.g. monitoring-nuts, monitoring-nodes, monitoring-proxmox etc.

## v4 - make it secure
- Kubescape scan of the code via GitHub actions
- Install Kubescape to the cluster

## v5 - protect data
- rClone with Backblaze

## v6 - remote access
- Cloudflared