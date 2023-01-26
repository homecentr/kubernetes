{{- define "common-labels" }}
app.kubernetes.io/name: homepage
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
{{- end }}

{{- define "pod-labels" }}
app.kubernetes.io/name: homepage
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}