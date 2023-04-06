{{- define "common.ingress-pomerium" }}
- ports:
    - protocol: {{ .protocol | default "TCP" }}
      port: {{ .port }}
  from:
  - namespaceSelector:
      matchLabels:
        kubernetes.io/metadata.name: pomerium
    podSelector:
      matchLabels:
        app.kubernetes.io/name: pomerium
{{- end }}

{{- define "common.ingress-pomerium" }}
- ports:
    - protocol: {{ .protocol | default "TCP" }}
      port: {{ .port }}
  from:
  - namespaceSelector:
      matchLabels:
        kubernetes.io/metadata.name: apps
    podSelector:
      matchLabels:
        app.kubernetes.io/name: homepage
{{- end }}

{{- define "common.egress-internet" }}
- to:
    - ipBlock:
        cidr: 0.0.0.0/0
        except:
          - 10.0.0.0/8
          - 172.16.0.0/12
          - 192.168.0.0/16
{{- end }}

{{- define "common.egress-kubeapi" }}
- to:
  {{- range $node := .Values.networkPolicy.kubeApiNodes }}
  - ipBlock:
      cidr: {{ $node }}/32
  {{- end }}
  ports:
  - protocol: TCP
    port: 6443

- to:
  - ipBlock:
      cidr: {{ .Values.networkPolicy.kubeApiService }}/32
  ports:
  - protocol: TCP
    port: 443
{{- end }}

{{- define "common.egress-all-pods-across-all-namespaces" }}
- to:
    - namespaceSelector: {}
      podSelector: {}
{{- end }}

{{- define "common.ports" }}
ports:
  {{- range $port := . }}
  - protocol: {{ $port.protocol | default "TCP" }}
    port: {{ $port.port }}
  {{- end }}
{{- end }}