{{- define "common.critical-only" }}
- key: homecentr.one/critical-only
  operator: Exists
  effect: NoSchedule
{{- end }}