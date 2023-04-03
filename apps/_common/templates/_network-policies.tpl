{{- define "common.ingress-pomerium" }}
- ports:
    - protocol: {{ .Values.networkPolicy.pomeriumIngress.protocol | default "TCP" }}
      port: {{ .Values.networkPolicy.pomeriumIngress.port }}
  from:
  - namespaceSelector:
      matchLabels:
        kubernetes.io/metadata.name: pomerium
    podSelector:
      matchLabels:
        app.kubernetes.io/name: pomerium
{{- end }}

{{- define "common.ingress-homepage" }}
# TBA
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

{{- define "common.egress-dns" }}
- ports:
  - protocol: TCP
    port: 53
  - protocol: UDP
    port: 53
  - protocol: TCP
    port: 5353
  - protocol: UDP
    port: 5353
  to:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: kube-system
      podSelector:
        matchLabels:
          app.kubernetes.io/instance: kube-dns
{{- end }}