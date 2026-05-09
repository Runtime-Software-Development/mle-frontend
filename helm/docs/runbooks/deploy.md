```markdown
# Kubernetes Runbook: Deploy React Application with Helm

## 1) Purpose
Deploy and verify the React application in Kubernetes using the Helm chart in this repository.

## 2) Prerequisites
- Kubernetes cluster access (`kubectl` configured)
- Helm 3 installed
- Container image for the React app is available in a registry
- Repository cloned locally

## 3) Deployment Inputs
Set these values before deployment:

- `NAMESPACE`: target namespace (example: `web`)
- `RELEASE_NAME`: Helm release name (example: `react-app`)
- `CHART_PATH`: path to chart in repo (example: `./helm/react-app`)
- `IMAGE_REPOSITORY`: container repository
- `IMAGE_TAG`: image tag/version
- `INGRESS_HOST`: public hostname (if ingress enabled)

## 4) One-Time Namespace Setup

## 5) Helm Deployment

```bash
# DEBUG
helm template mle-frontend ./helm --debug

# Installation
helm upgrade --install mle-frontend ./helm

# Upgrade deployment
helm upgrade mle-frontend ./helm
```