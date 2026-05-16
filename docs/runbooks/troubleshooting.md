```markdown
# Kubernetes Troubleshooting Runbook: MLE Frontend React App

## Overview
This runbook provides step-by-step troubleshooting guides for common issues with the MLE Frontend React App deployed via Helm.

---

## 1. Deployment Issues



```bash
kubectl get events -n mlp-explorer-test --sort-by='.lastTimestamp'
```

```text
To enter a running pod and execute commands directly, you use the `kubectl exec` command. While we call it "SSH-ing" into a pod, it’s technically opening an interactive shell session through the Kubernetes API rather than using the SSH protocol.

### The Standard Command

If your pod has only one container, use:

```bash
kubectl exec -it <pod-name> -n <namespace> -- /bin/sh

```

**Breakdown of the flags:**

* **`-i` (interactive):** Keeps `stdin` open even if not attached.
* **`-t` (tty):** Allocates a pseudo-terminal (makes it look like a real shell).
* **`--`:** This is the "end of options" separator. Everything after this is the actual command you want to run inside the pod.
* **`/bin/sh` or `/bin/bash`:** The shell you want to open. (Note: Alpine-based images, like your Nginx frontend, usually only have `/bin/sh`).

---

### Common Scenarios

#### 1. If the Pod has multiple containers

If you have a sidecar or multiple containers in one pod, you must specify which one you want to enter:

```bash
kubectl exec -it <pod-name> -c <container-name> -n <namespace> -- /bin/sh

```

#### 2. Running a single command without staying inside

If you just want to check a file or environment variable quickly:

```bash
kubectl exec <pod-name> -n <namespace> -- ls /etc/nginx/conf.d/

```

#### 3. Handling Permissions (Non-Root)

Since your frontend pod is running with `runAsNonRoot: true`, when you "SSH" in, you will be logged in as the `nginx` user (UID 1000). You will not be able to run `sudo` or modify system files.

---

### Troubleshooting "SSH" Failures

* **"Executable file not found":** This happens if you try to run `/bin/bash` on a very slim image (like Alpine or Distroless). Try `/bin/sh` or just `sh`.
* **"Pod is not in Running state":** You cannot exec into a pod that is in `CrashLoopBackOff` or `Pending`. You’ll need to use `kubectl logs <pod-name>` instead to see why it failed.
* **Timeout/Forbidden:** This usually means your `kubectl` context has expired or the UVic cluster's Network Policies are blocking the API server from reaching the node where the pod lives.

### Pro-Tip for Nginx

Since you are debugging your Nginx config, once you are inside the pod, you can verify the configuration is valid without restarting by running:

```bash
nginx -t

```

This is a lifesaver for checking if your `proxy_pass` or `rewrite` syntax is correct before committing changes to your Helm chart.
```