```markdown
# Kubernetes Troubleshooting Runbook: MLE Frontend React App

## Overview
This runbook provides step-by-step troubleshooting guides for common issues with the MLE Frontend React App deployed via Helm.

---

## 1. Deployment Issues

### 1.1 Check Deployment Status

### 1.2 Events

```bash
kubectl get events -n mlp-explorer-test --sort-by='.lastTimestamp'
```
```