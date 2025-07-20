#!/bin/bash

# --- Configuration Variables ---
# IMPORTANT: Set the absolute path to your API repository directory!
API_REPO_DIR="/opt/mlp/mle-api"
FRONTEND_REPO_DIR="/opt/mlp/mle-frontend"

PM2_CONFIG_FILE="pm2_mle_apps_config.json"

# List of application names PM2 will manage (for stopping/deleting existing ones)
APP_NAMES_TO_MANAGE=("mle-client-prod" "mle-client-dev" "mle-api" "mle-queue")

# Directory where the PM2 config file will be created temporarily
# This will be within the FRONTEND_REPO_DIR where the script is located.
PM2_CONFIG_WORKING_DIR="${FRONTEND_REPO_DIR}"

# --- Functions ---

# Function to check if a command exists
command_exists () {
  command -v "$1" >/dev/null 2>&1
}

# Function to create a log directory and check permissions
create_log_dir() {
  local dir_path="$1"
  echo "Creating log directory: ${dir_path}"
  mkdir -p "${dir_path}"
  if [ $? -ne 0 ]; then
    echo "Error: Failed to create log directory ${dir_path}. Check permissions."
    exit 1
  fi
}

# --- Main Script Execution ---

echo "--- Starting Multi-Application Deployment Script ---"
echo "Running from: $(pwd)"
echo "Frontend Repository: ${FRONTEND_REPO_DIR}"
echo "API Repository: ${API_REPO_DIR}"


# 1. Basic checks for required tools
echo "Verifying prerequisites (Node.js, npm)..."
if ! command_exists node; then
  echo "Error: Node.js not found. Please ensure Node.js and npm are installed and in your PATH."
  exit 1
fi
if ! command_exists npm; then
  echo "Error: npm not found. Please ensure Node.js and npm are installed and in your PATH."
  exit 1
fi
echo "Node.js and npm found."

# 2. Check Node.js version
CURRENT_NODE_VERSION=$(node -v)
echo "Detected Node.js version: ${CURRENT_NODE_VERSION}"
# Optional: Add a check for a specific Node.js version if needed
# REQUIRED_NODE_MAJOR_VERSION="v14"
# if [[ ! "${CURRENT_NODE_VERSION}" =~ ^${REQUIRED_NODE_MAJOR_VERSION} ]]; then
#   echo "Warning: Node.js version mismatch. Expected major version ${REQUIRED_NODE_MAJOR_VERSION}, but found ${CURRENT_NODE_VERSION}."
#   echo "Please ensure you are using the correct Node.js version as specified in your package.json (engines.node)."
#   # exit 1 # Uncomment this to make it a strict requirement
# fi

# --- Frontend (mle-frontend) Deployment ---
echo ""
echo "--- Deploying mle-frontend ---"
# Ensure we are in the frontend directory (where this script is located)
cd "${FRONTEND_REPO_DIR}" || { echo "Error: Could not change to frontend directory. This is unexpected for an in-repo script."; exit 1; }

create_log_dir "${FRONTEND_REPO_DIR}/logs"

echo "Installing frontend Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
  echo "Error: npm install failed in ${FRONTEND_REPO_DIR}. Check your network connection or package.json."
  exit 1
fi
echo "Frontend dependencies installed."

echo "Building React Frontend application for production..."
npm run build
if [ $? -ne 0 ]; then
  echo "Error: React Frontend build failed. Check your React project configuration."
  exit 1
fi
echo "React Frontend application built successfully."

# --- API (mle-api) Deployment ---
echo ""
echo "--- Deploying mle-api (API application) ---"
create_log_dir "${API_REPO_DIR}/api/logs"

echo "Navigating to API directory: ${API_REPO_DIR}/api"
cd "${API_REPO_DIR}/api" || { echo "Error: Could not change to API directory. Please check API_REPO_DIR path."; exit 1; }

echo "Installing API Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
  echo "Error: npm install failed in ${API_REPO_DIR}/api. Check your network connection or package.json."
  exit 1
fi
echo "API dependencies installed."

# --- Queue (mle-queue) Deployment ---
echo ""
echo "--- Deploying mle-queue (Queue application) ---"
create_log_dir "${API_REPO_DIR}/queue/logs"

echo "Navigating to Queue directory: ${API_REPO_DIR}/queue"
cd "${API_REPO_DIR}/queue" || { echo "Error: Could not change to Queue directory. Please check its path."; exit 1; }

echo "Installing Queue Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
  echo "Error: npm install failed in ${API_REPO_DIR}/queue. Check your network connection or package.json."
  exit 1
fi
echo "Queue dependencies installed."

echo "Running Queue's build script (for sharp, etc.)..."
npm run build
if [ $? -ne 0 ]; then
  echo "Warning: Queue's build script failed. This might be okay if it's optional, but check for issues."
  # Do not exit here, as it might be a non-critical build step.
fi
echo "Queue build script executed."

# --- PM2 Configuration and Startup ---
echo ""
echo "--- Configuring and Starting Applications with PM2 ---"

# Return to the frontend directory for PM2 command execution and config file creation
echo "Returning to PM2 config working directory: ${PM2_CONFIG_WORKING_DIR}"
cd "${PM2_CONFIG_WORKING_DIR}" || { echo "Error: Could not return to PM2 config working directory."; exit 1; }

# Construct the path to the local PM2 executable (from frontend repo's node_modules)
LOCAL_PM2_BIN="${FRONTEND_REPO_DIR}/node_modules/.bin/pm2" # Or whichever repo PM2 is a primary dependency for

# Verify local PM2 executable
echo "Verifying local PM2 executable at: ${LOCAL_PM2_BIN}"
if [ ! -f "${LOCAL_PM2_BIN}" ]; then
  echo "Error: Local PM2 executable not found at ${LOCAL_PM2_BIN}."
  echo "Please ensure PM2 is a dependency in your mle-frontend (or chosen) package.json and 'npm install' was run there."
  exit 1
fi
echo "Local PM2 executable found."

# Create comprehensive PM2 configuration file
echo "Creating comprehensive PM2 configuration file: ${PM2_CONFIG_FILE}"
cat << EOF > "${PM2_CONFIG_FILE}"
[
  {
    "name": "mle-client-dev",
    "script": "npm",
    "args": "start",
    "cwd": "${FRONTEND_REPO_DIR}",
    "watch": true,
    "ignore_watch": ["node_modules", "build", "logs"],
    "instances": 1,
    "exec_mode": "fork",
    "env": {
      "NODE_ENV": "development"
    },
    "max_memory_restart": "250M",
    "log_date_format": "YYYY-MM-DD HH:mm Z",
    "error_file": "${FRONTEND_REPO_DIR}/logs/mle_client_dev_error.log",
    "out_file": "${FRONTEND_REPO_DIR}/logs/mle_client_dev_output.log",
    "time": true
  },
  {
    "name": "mle-client-prod",
    "script": "npm",
    "args": "run serve",
    "cwd": "${FRONTEND_REPO_DIR}",
    "watch": false,
    "ignore_watch": ["node_modules", "src", "public", "logs"],
    "instances": 4,
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production"
    },
    "max_memory_restart": "150M",
    "log_date_format": "YYYY-MM-DD HH:mm Z",
    "error_file": "${FRONTEND_REPO_DIR}/logs/mle_client_prod_error.log",
    "out_file": "${FRONTEND_REPO_DIR}/logs/mle_client_prod_output.log",
    "time": true
  },
  {
    "name": "mle-queue",
    "script": "app.js",
    "cwd": "${API_REPO_DIR}/queue",
    "node_args": ["--inspect", "--expose-gc"],
    "max_memory_restart": "4096M",
    "watch": false,
    "instances": 3,
    "exec_mode": "cluster",
    "ignore_watch": ["node_modules", "logs"],
    "env": {
      "NODE_ENV": "development"
    },
    "env_production": {
      "NODE_ENV": "production"
    },
    "log_date_format": "YYYY-MM-DD HH:mm Z",
    "error_file": "${API_REPO_DIR}/queue/logs/mle_queue_error.log",
    "out_file": "${API_REPO_DIR}/queue/logs/mle_queue_output.log",
    "time": true
  },
  {
    "name": "mle-api",
    "script": "server.js",
    "cwd": "${API_REPO_DIR}/api",
    "watch": false,
    "ignore_watch": ["node_modules", "logs"],
    "instances": 4,
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "development"
    },
    "env_production": {
      "NODE_ENV": "production"
    },
    "max_memory_restart": "1000M",
    "log_date_format": "YYYY-MM-DD HH:mm Z",
    "error_file": "${API_REPO_DIR}/api/logs/mle_api_error.log",
    "out_file": "${API_REPO_DIR}/api/logs/mle_api_output.log",
    "time": true
  }
]
EOF

if [ $? -ne 0 ]; then
  echo "Error: Failed to create PM2 configuration file."
  exit 1
fi
echo "PM2 configuration file created."

# 14. Stop and delete any existing PM2 processes for these apps
echo "Stopping and deleting any existing PM2 processes for controlled applications..."
for app_name in "${APP_NAMES_TO_MANAGE[@]}"; do
  echo "  - Stopping/deleting ${app_name}..."
  "${LOCAL_PM2_BIN}" stop "${app_name}" 2>/dev/null
  "${LOCAL_PM2_BIN}" delete "${app_name}" 2>/dev/null
done
echo "Existing PM2 processes cleared."

# 15. Start all applications with local PM2
echo "Starting all applications with local PM2 from ${PM2_CONFIG_FILE}..."
"${LOCAL_PM2_BIN}" start "${PM2_CONFIG_FILE}"
if [ $? -ne 0 ]; then
  echo "Error: Failed to start applications with PM2. Check PM2 logs for details."
  exit 1
fi
echo "All applications started successfully with PM2."

# 16. Save the PM2 process list to ensure it restarts on PM2 reboot
echo "Saving PM2 process list using local PM2..."
"${LOCAL_PM2_BIN}" save
if [ $? -ne 0 ]; then
  echo "Warning: Failed to save PM2 process list using local PM2. Auto-restart might not work on PM2 restart."
fi

# 17. Configure PM2 to start on system boot
# echo "Configuring PM2 to start on system boot (requires sudo)..."
# PM2_STARTUP_COMMAND=$("${LOCAL_PM2_BIN}" startup systemd | grep "sudo env PATH")

# if [ -z "${PM2_STARTUP_COMMAND}" ]; then
#   echo "Error: PM2 startup command could not be generated using local PM2. This often means PM2 cannot find itself for system startup configuration."
#   echo "Please ensure PM2 is accessible in your PATH, or consider installing it globally for system startup persistence."
#   echo "Alternatively, you may need to set up a custom systemd service file to use local PM2 for startup."
#   exit 1
# fi

# echo "Running PM2 startup command: ${PM2_STARTUP_COMMAND}"
# eval "${PM2_STARTUP_COMMAND}"
# if [ $? -ne 0 ]; then
#   echo "Warning: Failed to configure PM2 for system startup. You might need to run the generated 'sudo env PATH...' command manually with the correct PATH for PM2."
# fi

echo "--- Deployment Script Finished ---"
echo "You can check the status of your applications with: ${LOCAL_PM2_BIN} status"
echo "Check individual application logs in their respective 'logs' subdirectories."