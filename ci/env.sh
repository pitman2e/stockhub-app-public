#!/bin/sh
# Use the environmental variable and inject env-config.js value to user browser

# Path to the deployed env.js file inside the Nginx container
ENV_FILE="/usr/share/nginx/html/env-config.js"

# Recreate the file
rm -f $ENV_FILE
touch $ENV_FILE

# Write the runtime environment variables into the JS file
echo "window.__ENV__ = {" >> $ENV_FILE
echo "  API_URL: \"$API_URL\"," >> $ENV_FILE
echo "  DEMO_JWT: \"$DEMO_JWT\"," >> $ENV_FILE
echo "};" >> $ENV_FILE
