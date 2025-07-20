#!/bin/bash

# --- Configuration Variables ---
# IMPORTANT: Set the absolute path to your React application directory
APP_DIR="/opt/mlp/mle-frontend"
PM2_CONFIG_FILE="pm2_react_config.json"
APP_NAME_PROD="mle-client-prod"
LOG_DIR="${APP_DIR}/logs"

# --- Functions ---

# Function to check if a command exists
command_exists () {
  command -v "$1" >/dev/null 2>&1
}

# --- Main Script Execution ---

echo "--- Starting React Application Deployment Script (Using Local PM2) ---"

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
# REQUIRED_NODE_MAJOR_VERSION="v14" # As per your package.json, major version 14
# if [[ ! "${CURRENT_NODE_VERSION}" =~ ^${REQUIRED_NODE_MAJOR_VERSION} ]]; then
#   echo "Warning: Node.js version mismatch. Expected major version ${REQUIRED_NODE_MAJOR_VERSION}, but found ${CURRENT_NODE_VERSION}."
#   echo "Please ensure you are using the correct Node.js version as specified in package.json (engines.node)."
#   # exit 1 # Uncomment this to make it a strict requirement
# fi


# 3. Create logs directory if it doesn't exist
echo "Creating logs directory: ${LOG_DIR}"
mkdir -p "${LOG_DIR}"
if [ $? -ne 0 ]; then
  echo "Error: Failed to create logs directory. Check permissions."
  exit 1
fi

# 4. Navigate to the application directory
echo "Navigating to application directory: ${APP_DIR}"
cd "${APP_DIR}" || { echo "Error: Could not change to application directory. Please check APP_DIR path."; exit 1; }

# 5. Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
  echo "Error: npm install failed. Check your network connection or package.json."
  exit 1
fi
echo "Node.js dependencies installed."

# Construct the path to the local PM2 executable
LOCAL_PM2_BIN="${APP_DIR}/node_modules/.bin/pm2"

# 6. Verify local PM2 installation
echo "Verifying local PM2 installation at: ${LOCAL_PM2_BIN}"
if [ ! -f "${LOCAL_PM2_BIN}" ]; then
  echo "Error: Local PM2 executable not found at ${LOCAL_PM2_BIN}."
  echo "Please ensure PM2 is a dependency in your package.json (e.g., npm install pm2) or installed globally."
  exit 1
fi
echo "Local PM2 executable found."

# 7. Build the React application for production
echo "Building React application for production..."
npm run build
if [ $? -ne 0 ]; then
  echo "Error: React build failed. Check your React project configuration."
  exit 1
fi
echo "React application built successfully."

# 8. Create PM2 configuration file
echo "Creating PM2 configuration file: ${PM2_CONFIG_FILE}"
cat << EOF > "${PM2_CONFIG_FILE}"
[
  {
    "name": "mle-client-dev",
    "script": "npm",
    "args": "start",
    "watch": true,
    "ignore_watch": ["node_modules", "build", "logs"],
    "instances": 1,
    "exec_mode": "fork",
    "env": {
      "NODE_ENV": "development"
    },
    "max_memory_restart": "250M",
    "log_date_format": "YYYY-MM-DD HH:mm Z",
    "error_file": "./logs/mle_client_dev_error.log",
    "out_file": "./logs/mle_client_dev_output.log",
    "time": true
  },
  {
    "name": "mle-client-prod",
    "script": "npm",
    "args": "run serve",
    "watch": false,
    "ignore_watch": ["node_modules", "src", "public", "logs"],
    "instances": 4,
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production"
    },
    "max_memory_restart": "150M",
    "log_date_format": "YYYY-MM-DD HH:mm Z",
    "error_file": "./logs/mle_client_prod_error.log",
    "out_file": "./logs/mle_client_prod_output.log",
    "time": true
  }
]
EOF

if [ $? -ne 0 ]; then
  echo "Error: Failed to create PM2 configuration file."
  exit 1
fi
echo "PM2 configuration file created."

# 9. Stop any existing PM2 process for this app (optional, but good for re-runs)
echo "Stopping any existing PM2 process for ${APP_NAME_PROD} using local PM2..."
"${LOCAL_PM2_BIN}" stop "${APP_NAME_PROD}" 2>/dev/null
"${LOCAL_PM2_BIN}" delete "${APP_NAME_PROD}" 2>/dev/null

# 10. Start the React application with local PM2 in production mode
echo "Starting React application '${APP_NAME_PROD}' with local PM2..."
"${LOCAL_PM2_BIN}" start "${PM2_CONFIG_FILE}" --only "${APP_NAME_PROD}"
if [ $? -ne 0 ]; then
  echo "Error: Failed to start application with PM2. Check PM2 logs for details."
  exit 1
fi
echo "Application started successfully with PM2."

# 11. Save the PM2 process list to ensure it restarts on PM2 reboot
echo "Saving PM2 process list using local PM2..."
"${LOCAL_PM2_BIN}" save
if [ $? -ne 0 ]; then
  echo "Warning: Failed to save PM2 process list using local PM2. Auto-restart might not work on PM2 restart."
fi

# 12. Configure PM2 to start on system boot
echo "Configuring PM2 to start on system boot (requires sudo)..."
# This command generates a systemd startup script and enables it.
# It MUST be run as root to configure systemd.
# We ensure the PM2_HOME environment variable is set to where the local PM2 stores its data
# (typically ~/.pm2 or whatever it defaults to when run by the user)
# when the systemd service runs.
# IMPORTANT: The 'pm2 startup' command needs to be run using the *global* pm2 for systemd,
# as the systemd service needs to manage PM2 itself.
# If you strictly want *local* PM2 to manage things, this becomes more complex
# as the systemd service would need to specifically invoke your local PM2 path.
# For simplicity and standard practice, it's usually the global PM2 that handles startup.
# However, if you explicitly want the systemd service to use your project's local PM2,
# we need to adjust the `pm2 startup` command slightly.
# Let's use the current user's global PM2 for the `pm2 startup` command,
# but ensure that the user specified with `-u` is your application user.
# First, ensure that PM2 can be found in the PATH when running with sudo for the startup command.
# This often means ensuring npm's global bin path is in root's PATH, or specifying the full path.
# A more robust way to handle startup with local PM2:
# 1. Create a custom systemd service file (more complex, but gives full control)
# 2. Let pm2 startup create its standard systemd file, then modify it to use local PM2 (also complex)
# For simplicity, if you have PM2 installed locally *only*, and not globally,
# the `pm2 startup` command might fail as it expects a globally accessible `pm2` command.
# If you intend to use *only* local PM2, you would typically need a custom systemd service
# that points to your app's `node_modules/.bin/pm2` executable.
#
# For now, let's assume a global PM2 might also be present for `pm2 startup` to work cleanly,
# or that `pm2 startup` itself will correctly configure to use the current user's PM2 setup.
# The command `pm2 startup systemd` usually asks you to run a specific `sudo` command with a PATH.
# We'll use the one generated by `pm2 startup`.

# Get the recommended startup command from PM2 (this needs global PM2 or PM2 in PATH)
# This command typically outputs something like:
# sudo env PATH=$PATH:/home/user/.nvm/versions/node/vX.Y.Z/bin pm2 startup systemd -u youruser --hp /home/youruser
echo "Attempting to generate and run PM2 startup script..."
PM2_STARTUP_COMMAND=$("${LOCAL_PM2_BIN}" start ${PM2_CONFIG_FILE})

if [ -z "${PM2_STARTUP_COMMAND}" ]; then
  echo "Error: PM2 startup command could not be generated using local PM2. This often means PM2 cannot find itself or needs a global install for this feature."
  echo "Please ensure PM2 is accessible in your PATH, or install it globally for system startup."
  echo "Alternatively, you may need to set up a custom systemd service file to use local PM2 for startup."
  exit 1
fi

echo "Running PM2 startup command: ${PM2_STARTUP_COMMAND}"
# Execute the generated command. This part still requires sudo.
eval "${PM2_STARTUP_COMMAND}" # 'eval' is used to execute the string as a command
if [ $? -ne 0 ]; then
  echo "Warning: Failed to configure PM2 for system startup. You might need to run the generated 'sudo env PATH...' command manually with the correct PATH for PM2."
fi

echo "--- Deployment Script Finished ---"
echo "You can check the status of your application with: ${LOCAL_PM2_BIN} status"
echo "Logs can be found in: ${LOG_DIR}"