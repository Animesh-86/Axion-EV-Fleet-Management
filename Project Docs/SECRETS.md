**Secrets & Environment Variables**

- Purpose: central guidance for provisioning secrets for local development and production.

Quick start
- Copy `.env.example` to `.env` and fill in secure values for local testing.
- Never commit `.env` to git.

Recommended production options
- Use a managed secret store: HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, or Kubernetes Secrets.
- Mount secrets into containers using Docker Secrets or orchestration-specific secret mounts.
- Rotate credentials regularly and revoke any leaked keys immediately.

Key variables
- `POSTGRES_PASSWORD` — Postgres password used by `postgres` service.
- `TIMESCALEDB_PASSWORD` — TimescaleDB/Postgres password used by `timescaledb`.
- `AXION_POSTGRES_URL` / `AXION_TSDB_URL` — JDBC connection strings for backend.
- `OPENAI_API_KEY` / `AXION_OPENAI_KEY_FILE` — OpenAI API key; prefer mounting the key into `/run/secrets/OPENAI_API_KEY`.
- `AXION_BOOTSTRAP_ADMIN_PASSWORD` — Initial admin password; change after first login.
- `GF_SECURITY_ADMIN_PASSWORD` — Grafana admin password; set for secure access.

Deployment checklist
1. Replace all `change_me`/placeholder values with real secrets or secret references.
2. Ensure `.env` is listed in `.gitignore`.
3. Configure CI/CD to inject secrets securely into build and deployment stages; never echo secrets in logs.
4. For Kubernetes deployments, create Secrets and reference them in Deployments/StatefulSets.

If you want, I can:
- Add automated scripts to create Docker secrets from your local `.env`.
- Replace remaining example passwords in configuration files with explicit `${VAR}` placeholders and fail fast if missing.

Environments
 - Local: use `.env.local` (copy from `.env.local.example`) for developer machines and CI preview builds.
 - Production: provide values via secret manager or copy `.env.production.example` to your deployment environment and inject real secrets; never commit production secrets.

Recommended workflow
1. Developers copy `.env.local.example` to `.env` or `.env.local` and fill values for quick local runs.
2. CI/CD and production use secret injection (Vault, AWS Secrets Manager, Azure Key Vault, or Docker/Kubernetes secrets). Use `.env.production.example` as documentation for required keys.
