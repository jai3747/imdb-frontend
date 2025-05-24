{{/*
Expand the name of the chart.
*/}}
{{- define "imdb-clone.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "imdb-clone.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "imdb-clone.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "imdb-clone.labels" -}}
helm.sh/chart: {{ include "imdb-clone.chart" . }}
{{ include "imdb-clone.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "imdb-clone.selectorLabels" -}}
app.kubernetes.io/name: {{ include "imdb-clone.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "imdb-clone.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "imdb-clone.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
MongoDB Connection String
*/}}
{{- define "imdb-clone.mongoUrl" -}}
{{- if .Values.mongodb.atlas.enabled }}
{{- .Values.mongodb.atlas.mongoUrl }}
{{- else if .Values.mongodb.enabled }}
{{- printf "mongodb://%s:%s@mongodb-service:%v/%s" .Values.mongodb.auth.rootUser .Values.mongodb.auth.rootPassword .Values.mongodb.port .Values.mongodb.database }}
{{- else }}
{{- "mongodb://localhost:27017/imdb_clone" }}
{{- end }}
{{- end }}