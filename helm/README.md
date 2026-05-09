# MLE Frontend Helm Chart

Deploy the MLE Frontend (React) application to Kubernetes.

## Install from OCI (GitHub Container Registry)

After the chart is published by CI, install from GHCR:

```bash
# Log in to GHCR (for private charts)
helm registry login ghcr.io

# Install from OCI
helm upgrade --install mle-frontend oci://ghcr.io/Runtime-Software-Development/mle-frontend \
  --version 1.5.0 \
  --namespace <namespace> \
  --set image.repository=ghcr.io/runtime-software-development/mle-frontend \
  --set image.tag=latest
```

Replace `1.5.0` with the chart version you need (or omit for latest).

## Install from local chart

```bash
helm upgrade --install mle-frontend ./helm -n <namespace> \
  --set image.repository=ghcr.io/runtime-software-development/mle-frontend \
  --set image.tag=<tag>
```

## Building and publishing (CI)

- **Container image**: Workflow `publish-app-container.yml` builds the Docker image (multi-stage, `production` target) and pushes to `ghcr.io/<owner>/mle-frontend` on push to `main` (with path filters) or on tags `v*.*.*`, or via workflow_dispatch.
- **Helm chart (OCI)**: Workflow `publish-app-chart.yaml` packages the chart and pushes to `oci://ghcr.io/<owner>/mle-frontend` on push to `main`/tags when `helm/**` or the workflow file changes, or via workflow_dispatch.

Use the same image tag (e.g. `latest` or a git SHA tag) when installing the chart so the deployment uses the intended image.
