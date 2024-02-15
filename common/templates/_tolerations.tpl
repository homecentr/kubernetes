{{- define "common.critical-only" }}
- key: CriticalAddonsOnly
  operator: Exists
  effect: NoSchedule
{{- end }}
