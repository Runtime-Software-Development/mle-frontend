# Mountain Legacy Explorer (MLE) Application

----------------

## Overview

The Mountain Legacy Explorer (MLE) app is a web-based frontend interface designed to provide users with an intuitive and interactive way to explore the Mountain Legacy Project's (MLP) collection of historic and modern survey images.

### Mountain Legacy Project (MLP)

 The [Mountain Legacy Project](http://mountainlegacy.ca/) at the University of Victoria supports numerous research initiatives exploring the use of repeat photography to study ecosystem, landscape, and anthropogenic changes. MLP hosts the largest systematic collection of mountain photographs, with over 120,000 high-resolution historic (grayscale) survey photographs of Canada’s Western mountains captured from the 1880s through the 1950s, with over 9,000 corresponding modern (colour) repeat images. Over the years, the MLP has built a suite of custom tools for the classification and analysis of images in the collection (Gat et al. 2011; Jean et al. 2015b; Sanseverino et al. 2016). 

## Features
------------

*   **Image Browser**: Browse through the MLP's collection of over 120,000 high-resolution historic mountain photographs.
*   **Image Pairs**: View repeat photo pairs to visualize changes in the mountain landscape over time.
*   **Metadata Access**: Access related metadata for each image, including location, date, and photographer information.
*   **Search and Filter**: Search and filter images by location, date, and other criteria to quickly find specific images.

## Technology Stack
--------------------

*   **Frontend**: Built using ReactJS, a popular JavaScript library for building user interfaces.
*   **Backend**: Integrated with the MLE API, which provides access to the MLP's image collection and metadata.

## Local deployment
-------------------


This section describes how to run the MLE frontend on your machine for development or local use.

### Prerequisites

- **Node.js** — The project targets **Node 22** (see `engines.node` in `package.json`). Use [nvm](https://github.com/nvm-sh/nvm), [fnm](https://github.com/Schniz/fnm), or the [official installer](https://nodejs.org/) to match this version.
- **npm** — Installed with Node.js.
- **MLE API (for full functionality)** — The frontend talks to a separate API service. For local development the API is expected at `http://localhost:3001` by default. Clone and run the [mle-api](https://github.com/scrose/mle-api) repository if you need image data, search, and other backend features.

### Environment variables

The app reads configuration from environment variables. For local runs you can use `.env` or `.env.local` in the project root (Create React App loads both; `.env.local` overrides `.env` and is usually not committed).

| Variable | Description | Example (local) |
|----------|-------------|-----------------|
| `NODE_ENV` | Environment mode | `local` or `development` |
| `REACT_APP_API_BASEURL` | Base URL of the MLE API | `http://localhost:3001` |
| `REACT_APP_BASEURL` | Base URL of this frontend app | `http://localhost:3000` |

**Example `.env.local`:**

```bash
NODE_ENV=local
REACT_APP_API_BASEURL=http://localhost:3001
REACT_APP_BASEURL=http://localhost:3000
```

If you don’t have a `.env` or `.env.local`, create one with the values above so the app knows where to find the API and itself. Restart the dev server after changing env vars.

### Option 1: Run the frontend only (recommended for UI work)

1. **Clone the repository**
   ```bash
   git clone https://github.com/[repository-url]
   cd mle-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**  
   Ensure `.env` or `.env.local` exists with `REACT_APP_API_BASEURL` and `REACT_APP_BASEURL` as above.

4. **Start the development server**
   ```bash
   npm start
   ```
   The app will open at [http://localhost:3000](http://localhost:3000). Without the API running, features that depend on backend data (e.g. image browser, search) will not work, but you can develop UI and routing.

### Option 2: Run with Docker

The repo includes a **Dockerfile** (production build served with nginx) and **docker-compose** for a development-style run with hot reload.

- **Development (with file watching):**
  ```bash
  docker-compose up --build
  ```
  The frontend runs in a container with the project directory mounted; the app is available at `http://localhost:3000`. Ensure `.env` (or env vars in `docker-compose.yml`) match your setup; the compose file uses the `build` stage and `npm start` inside the container.

- **Production-style image:**  
  Build and run the multi-stage Dockerfile (build + nginx). The container serves the built app on port 80; map it as needed (e.g. `-p 3000:80`).

### Option 3: Full stack (frontend + API + queue) via script

For a full local deployment that builds the frontend and runs the API and queue, use the provided shell script:

1. **Edit `run-script.sh`**  
   Set `API_REPO_DIR` and `FRONTEND_REPO_DIR` to the absolute paths of your `mle-api` and `mle-frontend` clones.

2. **Run the script**
   ```bash
   ./run-script.sh
   ```
   It installs dependencies, builds the frontend, and uses PM2 to run the client, API, and queue. Ensure Node.js, npm, and PM2 are available and paths are correct.

### npm scripts

| Script | Purpose |
|--------|--------|
| `npm start` | Start the development server (default port 3000). |
| `npm run build` | Production build; output in `build/`. |
| `npm run serve` | Serve the `build/` folder locally (uses `serve`). |
| `npm test` | Run tests (Jest). |

### Troubleshooting

- **Port 3000 in use** — Stop the process using port 3000 or set `PORT=3001` (or another port) before `npm start`.
- **API requests fail or 404** — Confirm the MLE API is running at the URL in `REACT_APP_API_BASEURL` and CORS allows your frontend origin.
- **Changes to `.env` not applied** — Restart `npm start` (or the Docker container); Create React App only reads env at startup.
- **Docker build or run issues** — Ensure Docker and Docker Compose are up to date and that `.env` exists if the compose file references it.

## Getting started (quick reference)
------------------------------------

1. Clone the repository: `git clone https://github.com/[repository-url]`
2. Install dependencies: `npm install`
3. Add a `.env` or `.env.local` with `REACT_APP_API_BASEURL` and `REACT_APP_BASEURL` (see [Environment variables](#environment-variables) above).
4. Start the app: `npm start`

## Logs
------------

I'll pull the actual log endpoints, file names and response shapes from the code so the brief is accurate.

Ran terminal command: cd /Users/spencerrose/Workspace/External/mle/mle-api; grep -rn "logs" api/src/routes/*.js | head -30; grep -n "app.get('/queue/logs'\|readLogFile\|queue/logs" -n queue/server.js

Read , lines 20 to 80
Completed with input: {
  "path": "/Users/spencerrose/Workspace/External/mle/mle-api/queue/server.js",
  "view_range": [
    20,
    80
  ]
}

Read , lines 385 to 440
Completed with input: {
  "path": "/Users/spencerrose/Workspace/External/mle/mle-api/queue/server.js",
  "view_range": [
    385,
    440
  ]
}

Ran terminal command: cd /Users/spencerrose/Workspace/External/mle/mle-api/api/src; grep -n "logs\s*=\|logs(" -A60 controllers/main.controller.js | head -120

Ran terminal command: cd /Users/spencerrose/Workspace/External/mle/mle-api/api/src; sed -n 180,200p controllers/main.controller.js; sed -n 95,120p app.js; sed -n 245,290p app.js; grep -n "error.log\|errorLog\|ERROR_LOG" app.js error.js lib/*.js | head; sed -n 60,75p routes/main.routes.js; grep -rn "mainRoutes\|main.routes\|'/admin\|admin" routes/index.routes.js | head; grep -n "MLE_ERROR_LOG_FILE\|MLE_ACCESS_LOG" -r . ../../helm/templates | head

Ran terminal command: cd /Users/spencerrose/Workspace/External/mle/mle-api; sed -n 120,175p api/src/app.js; grep -n "LOG_FILE\|replicaCount\|replicas" helm/values.prod.yaml; grep -n "admin\|logs" api/src/routes/main.routes.js | head; grep -rn "'logs'\|logs:" api/src/lib/*.js api/src/services/*.js 2>/dev/null | head -5; grep -n "export function configureQueueLogging" -A40 queue/src/logging.js | head -60

Ran terminal command: cd /Users/spencerrose/Workspace/External/mle/mle-api; sed -n 163,172p queue/src/logging.js; grep -n "formatLine" -A12 queue/src/logging.js | head -16; sed -n 95,104p helm/values.prod.yaml; grep -n "level:\|LOG_LEVEL\|LOG_FORMAT" helm/values.prod.yaml | head; grep -rn "prepare\b" api/src/lib/api.utils.js | head -3; grep -n "restrict\|authorize\|admin" api/src/routes/index.routes.js | head

Ran terminal command: cd /Users/spencerrose/Workspace/External/mle/mle-api; sed -n 40,46p queue/src/logging.js; sed -n 76,79p helm/values.prod.yaml; sed -n 20,60p api/src/lib/api.utils.js; grep -rn "logs\|'admin/" api/src/config/*.js api/src/**/permissions* 2>/dev/null | head -5; grep -rln "admin/logs\|'/admin'" api/src | head

Ran terminal command: cd /Users/spencerrose/Workspace/External/mle/mle-api/api/src; sed -n 40,75p routes/index.routes.js; grep -n "logs\|admin" -i config/*.js 2>/dev/null | head -5; ls config 2>/dev/null
Tool execution failed with exit code 1

Ran terminal command: sed -n 46,60p api/src/lib/logging.utils.js; sed -n 22,46p api/src/lib/logging.utils.js; sed -n 5,8p helm/values.test.yaml helm/values.dev.yaml

Ran terminal command: grep -n "MLE_HTTP_LOG_ENABLED\|LOG_LEVEL" helm/values.prod.yaml helm/templates/*.yaml | head; kubectl exec -n mlp-explorer-prod deploy/mle-backend-mle-api-api -- sh -c 'echo LOG_LEVEL=$LOG_LEVEL HTTP=$MLE_HTTP_LOG_ENABLED DIR=$MLE_LOG_DIR; ls -la $MLE_LOG_DIR' 2>&1 | head; kubectl exec -n mlp-explorer-prod deploy/mle-backend-mle-api-queue -- sh -c 'echo LOG_LEVEL=$LOG_LEVEL; ls -la $MLE_LOG_DIR' 2>&1 | head

Here's a brief you can paste straight to the frontend agent. I built it from the current API and queue code (including the uncommitted changes) and checked it against the live prod pods.

````markdown
# MLE logs: backend reference for the frontend redesign

## Endpoint the frontend calls
`GET {MLE_API_BASEURL}/admin/logs`
- An admin-only route in the API (`api/src/routes/main.routes.js`, controller `logs` in `api/src/controllers/main.controller.js`).
- The user's role must be allowed by the database permissions for this route. Send the normal authenticated request (same session/cookies as other `/admin/*` calls).
- The frontend never calls the queue directly. The API fetches the queue's logs from `{MLE_QUEUE_SERVER_URL}/queue/logs` on the internal network and merges them into its own response.

## Response shape
```json
{
  "model": { "name": "", "attributes": {} },
  "path": {},
  "view": "logs",
  "message": {},
  "user": null,
  "data": [
    { "source": "api",   "file": "error.log",        "contents": ["line", "..."] },
    { "source": "api",   "file": "access.log",       "contents": [], "missing": true, "details": "ENOENT: ..." },
    { "source": "queue", "file": "queue-error.log",  "contents": ["..."] },
    { "source": "queue", "file": "queue-access.log", "contents": ["..."] },
    { "source": "queue", "file": "queue.log",        "contents": ["..."] }
  ]
}
```
- `data` is an array of log-file objects: `{ source: 'api' | 'queue', file: string, contents: string[], missing?: true, details?: string }`.
- `contents` is the whole current file split on `\n`. The last element is usually `""`, so drop empty trailing lines.
- Order is always: API files first (`error.log`, `access.log`), then queue files (`queue-error.log`, `queue-access.log`, `queue.log`).
- **If the queue can't be reached**, the queue part is replaced by one placeholder: `{ source: 'queue', file: 'queue-log-fetch-error', contents: [], missing: true, details: '<reason>' }`. Show this as "Queue logs unavailable: <details>", not as an empty log.
- **`missing: true` on a normal file is expected**, not an error. Logs rotate (see below), and after a rotation the new file doesn't exist until the next line is written. Show "No entries since last rotation".

## Which file means what
| source | file | What it contains | Line format |
|---|---|---|---|
| api | `error.log` | Errors from the API's error handler, often with stack traces spanning several lines | `[2026-11-23T21:04:00.000Z] ERROR: <message>` then `Stack: ...` / `Details: {...}` on following lines |
| api | `access.log` | HTTP request log (morgan, Apache "combined" format with local date) | `1.2.3.4 - - [23/Nov/2026:21:04:00 -0700] "GET /path HTTP/1.1" 200 1234 "referrer" "user-agent"` |
| queue | `queue-error.log` | Anything the queue logged with `console.error`: job failures, Redis connection errors, and so on. Often multi-line (util.inspect output, stack traces) | `[2026-11-23T21:04:00.000Z] [ERROR] <message>` |
| queue | `queue-access.log` | HTTP requests made to the queue's own internal API | `2026-11-23T21:04:00.000Z [ACCESS] POST /jobs/process 200 12ms ip=::ffff:10.x.x.x ua="node-fetch"` |
| queue | `queue.log` | General queue app log (warn, info, debug) | `[2026-11-23T21:04:00.000Z] [WARN] <message>` (level is one of ERROR/WARN/INFO/DEBUG) |

Parsing tips:
- A new entry starts with `[` + an ISO timestamp (or an ISO timestamp, for `queue-access.log`). Any line that doesn't start that way is a continuation of the previous entry (stack trace, inspected object). Group continuation lines with their entry.
- Parse the level from `ERROR:` (API) or `[LEVEL]` (queue) to colour-code or filter.
- For access logs, the useful fields are method, path, status and duration (queue only). Filtering by status ≥ 400 is the most useful view.

## Recent backend changes that affect the UI
1. **Successful health checks are no longer logged.** API `/healthz` and queue `/health` requests appear only when they fail (status ≥ 400). Access logs are now short and meaningful, so any health-check line means something is wrong; highlight it.
2. **Rotation applies to every log file.** All five files rotate weekly or at 10 MB, and the 10 most recent archives are kept, gzipped. Archives are named like `20261118-0000-01-error.log.gz`, and **the endpoint does not return them**: it only returns the current file. Label the view "since last rotation".
3. **Log level is `warn` in dev, test and prod.** As a result:
   - **API `access.log` is normally empty or missing in every environment**, because HTTP access logging is off at warn level unless `MLE_HTTP_LOG_ENABLED=true` is set on the API. Show a hint like "HTTP access logging disabled at current log level" instead of an error state.
   - Queue `queue.log` contains only WARN and ERROR lines.
   - Queue `queue-access.log` is always written regardless of level. Since health checks are no longer logged, it now holds mainly job submission and status calls from the API.
4. **Logs are per pod, and the response comes from a single pod.** Prod runs 3 API replicas and 2 queue replicas. Each pod writes to its own folder (`/mnt/data/mle-backend-shared-logs/{api|queue}/<pod-name>/`). The response contains only the API pod that served the request plus whichever queue pod the internal service routed to.
   - Refreshing can show different content.
   - The response doesn't say which pod it came from.
   - In the UI, say that logs come from one instance and that refreshing may show another.
   - Don't assume the logs are complete or continuous across refreshes.
5. **Payload size.** Up to 5 files of up to 10 MB each, returned as string arrays.
   - Render with virtualisation or pagination: show the newest lines first or tail the last N, and collapse long files.
   - Don't render everything into the DOM at once.
   - There's no server-side paging, filtering or tail parameter yet; do all of that on the client.

## Related admin endpoints (for context; not log files)
- `GET /admin/status`: system/queue health.
- `GET /admin/jobs`: queue job list (proxied from the queue's status endpoint).

## Admin log viewer
- Choose API or Queue, then Errors, HTTP requests, or Activity. There is no pod selector.
- Each refresh fetches one snapshot. Switching sources/files reuses it without another request.
- The preview initially shows the newest 1,200 lines, with virtualised rendering. **Load Older** reveals another 1,200 lines on demand; search and time filters apply only to loaded lines.
- **More options** contains time filters, ordering, and optional auto-refresh (off by default).
- **Download Log** saves the complete selected current file from the fetched snapshot, regardless of preview filters. It does not download archives or collect other instances.
- The initial transfer still includes all current files because the backend has no tail/paging endpoint. Consolidating production logs into environment-specific files and reducing transfer size require backend changes; the frontend cannot perform either operation.
- Capture deletion displays a spinner and disables Delete and Cancel until the request completes. Failed requests display an error and allow retry.
````

## Issues
------------

If you encounter any issues with the MLE app, please submit an issue to the repository.

## License
------------

The MLE app is licensed under the MIT License.

## Team
---------

Developed and maintained by Runtime Software Development Inc.


### Repository
--------------

The MLE app repository is located at [https://github.com/scrose/mle-api](https://github.com/scrose/mle-api).

