{{- define "common.resource-labels" }}
app.kubernetes.io/name: {{ $.Chart.Name }}
app.kubernetes.io/instance: {{ $.Release.Name }}
app.kubernetes.io/managed-by: {{ $.Release.Service }}
app.kubernetes.io/version: {{ $.Chart.AppVersion }}
helm.sh/chart: {{ $.Chart.Name }}-{{ $.Chart.Version | replace "+" "_" }}
{{- end }}

{{- define "common.pod-labels" }}
app.kubernetes.io/name: {{ . }}
app.kubernetes.io/instance: {{ $.Release.Name }}
{{- end }}