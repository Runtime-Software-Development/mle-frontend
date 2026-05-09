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

## Contributing
------------

Contributions to the MLE app are welcome. Please submit a pull request to the repository with your changes.

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


