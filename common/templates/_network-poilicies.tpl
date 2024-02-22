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
- action: Allow
  protocol: TCP
  destination:
    ports:
      - 6443
    nets:
      - 10.1.8.11/32
      - 10.1.8.12/32
      - 10.1.8.13/32
- action: Allow
  protocol: TCP
  destination:
    ports:
      - 443
    nets:
      - 172.17.0.1/32
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
  protocol: {{ .protocol | default "TCP" | quote }}
  destination:
    ports:
      - {{ .port | quote }}
  source:
    services:
      name: pomerium-proxy
      namespace: pomerium-system
{{- end }}
