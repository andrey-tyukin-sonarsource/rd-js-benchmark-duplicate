#!/bin/bash

# Checks that `node` and `npm` are installed.
# Installs all the dependencies, if necessary.
# Starts the server.



# Check that `node` and `npm` are installed
node --version || {
  echo "'node' not available. exit."
  exit 1
}

npm --version || {
  echo "'npm' not available. exit."
  exit 2
}

# Download `node_modules`, if necessary
if [ ! -d './node_modules' ]
then
  npm install
fi

# Start the server
node main.js

# The server should now be running at `http://localhost:3000/`

