{{- define "calico-selector.postgresql-cluster" -}}
application == 'spilo' && cluster-name == '{{ . }}'
{{- end }}

{{- define "ingress.allow-postgresql-mandatory" }} 
# Allow internal component calls
- action: Allow
  source:
    selector: {{ include "calico-selector.postgresql-cluster" . }}

# Allow traffic from operator
- action: Allow
  source:
    services:
      name: postgres-operator
      namespace: postgresql-system
{{- end }}

{{- define "egress.allow-postgresql-mandatory" }}
# Allow internal component calls
- action: Allow
  destination:
    selector: {{ include "calico-selector.postgresql-cluster" . }}

# Allow traffic to operator
- action: Allow
  destination:
    services:
      name: postgres-operator
      namespace: postgresql-system

# Allow traffic to Kubernetes API to list endpoints of other replicas
{{- include "egress.allow-kubernetes-api" . }}
{{- end }}

{{- define "ingress.allow-postgresql-from-app" }}
# Allow Postgresql traffic from app
- action: Allow
  source:
    selector: {{ . }}
  protocol: TCP
  destination:
    ports:
      - 5432
{{- end }}
