Rotate OpenAI API key (runtime reload)

Overview

- The backend will load an OpenAI API key from a mounted file by default: `/run/secrets/OPENAI_API_KEY`.
- If that file exists at startup, its contents will be used as `spring.ai.openai.api-key`.
- You can override the default file path via the `AXION_OPENAI_KEY_FILE` env var or the `axion.openai.key-file` property.
- After replacing the key file on the host, call the reload endpoint to apply the new key without rebuilding the image or restarting the container.

How to mount the key with Docker Compose (example)

- Copy your OpenAI key into a file on the host (do NOT commit it to the repo):

```bash
echo "sk-..." > /tmp/axion_openai_key
chmod 600 /tmp/axion_openai_key
```

- Add a volume mount in your `docker-compose.override.yml` or service definition for the backend:

```yaml
services:
  backend:
    volumes:
      - /tmp/axion_openai_key:/run/secrets/OPENAI_API_KEY:ro
    environment:
      - AXION_OPENAI_KEY_FILE=/run/secrets/OPENAI_API_KEY
```

Reloading the key at runtime

- After you replace the file contents on the host, call the reload endpoint:

```bash
curl -X POST http://localhost:8080/admin/ai/reload-key -u <admin-user>:<admin-pass>
```

- The endpoint will return `{ "reloaded": true }` if a key was loaded, or `{ "reloaded": false }` if no readable key file was found.

Notes

- The application still uses the `OPENAI_API_KEY` environment variable as a fallback if the file is not present.
- For production, prefer Docker secrets, HashiCorp Vault, or cloud secret managers and mount the key file into the container.
- The `ChatClient` is now built at request time, so new keys take effect immediately after a successful reload.
