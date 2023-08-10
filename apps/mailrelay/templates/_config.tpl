{{- define "config" }}
{
  "smtp_server":  "{{ .Values.smtpRelay.host }}",
  "smtp_port":     {{ .Values.smtpRelay.port }},
  "smtp_starttls": {{ .Values.smtpRelay.startTls }},
  "smtp_username": "{{ .Values.smtpRelay.username }}",
  "smtp_password": "{{ .Values.smtpRelay.password }}",
  "smtp_max_email_size": {{ .Values.smtpRelay.maxSize }},
  "smtp_login_auth_type": false,
  "local_listen_ip": "0.0.0.0",
  "local_listen_port": 2525,
  "allowed_hosts": ["*"],
  "timeout_secs": 30
}
{{- end }}