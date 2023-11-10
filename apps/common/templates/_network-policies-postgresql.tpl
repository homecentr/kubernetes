{{- define "common.network-policy-postgresql-cluster" }}
{{- $appPodSelector := .AppPodSelector }}
{{- with .Root }}
{{- $clusterName := .Release.Name }}
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: {{ $clusterName }}-postgresql-cluster
  labels:
    {{- include "common.resource-labels" . | indent 4 }}
spec:
  podSelector:
    matchLabels:
      cnpg.io/podRole: instance
      cnpg.io/cluster: {{ $clusterName }}
  policyTypes:
    - Ingress
    - Egress
  egress:
    # Allow cluster instances to talk to Kube API
    {{- include "common.egress-kubeapi" . | indent 4 }}
  ingress:
    - ports:
        - protocol: TCP
          port: 5432
      from:
        # Accept traffic from postgresql jobs related to the same cluster
        - podSelector:
            matchExpressions:
              - key: cnpg.io/jobRole
                operator: Exists
              - key: cnpg.io/cluster
                operator: In
                values:
                  - {{ $clusterName }}
        # Accept traffic from other cluster instances
        - podSelector:
            matchLabels:
              cnpg.io/podRole: instance
              cnpg.io/cluster: {{ $clusterName }}
        
        {{- if $appPodSelector }}
        # Accept traffic from consuming app
        - podSelector: {{ $appPodSelector | toYaml | nindent 12 }}
        {{- end }}
        
    # Accept traffic from operator in postgresql-system namespace
    - ports:
        - protocol: TCP
          port: 8000
      from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: postgresql-system
          podSelector:
            matchLabels:
              app.kubernetes.io/name: cloudnative-pg
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: {{ $clusterName }}-postgresql-jobs
  labels:
    {{- include "common.resource-labels" . | indent 4 }}
spec:
  podSelector:
    matchExpressions:
      - key: cnpg.io/jobRole
        operator: Exists
      - key: cnpg.io/cluster
        operator: In
        values:
          - {{ $clusterName }}
  policyTypes:
    - Egress
  egress:
    # Allow jobs to talk to Kube API
    {{- include "common.egress-kubeapi" . | indent 4 }}
{{- end }}
{{- end }}
