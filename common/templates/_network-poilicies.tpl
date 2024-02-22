{{- define "egress.allow-internet" }}
- action: Allow
  destination:
    notNets:
      - 10.0.0.0/8
      - 172.16.0.0/12
{{- end }}

{{- define "egress.allow-kubernetes-api" }}
- action: Allow
  destination:
    services:
      name: kubernetes
      namespace: default
{{- end }}

{{- define "ingress.allow-kubernetes-api" }}
- action: Allow
  source:
    services:
      name: kubernetes
      namespace: default
{{- end }}

{{- define "ingress.allow-pomerium-proxy" }}
- action: Allow
  source:
    services:
      name: pomerium-proxy
      namespace: pomerium-system
  destination:
    ports:
      - {{ . }}
{{- end }}
