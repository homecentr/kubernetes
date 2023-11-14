{{- define "common.network-policy-mariadb-cluster" }}
{{- $port := (.Port | default 3306 ) }}
{{- with .Root }}
{{- $clusterName := (.ClusterName | default .Release.Name) }}
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: {{ $clusterName }}
  labels:
    {{- include "common.resource-labels" . | indent 4 }}
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: mariadb
      app.kubernetes.io/instance: {{ $clusterName }}
  policyTypes:
    - Ingress
  ingress:
    - from:
        # Accept traffic from other cluster instances
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: mariadb
              app.kubernetes.io/instance: {{ $clusterName }}
    - from:
        # Accept traffic from operator
        - podSelector:
            matchLabels: 
              app.kubernetes.io/name: mariadb-operator
              app.kubernetes.io/instance: mariadb-operator
          namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: mariadb-system
{{- end }}
{{- end }}