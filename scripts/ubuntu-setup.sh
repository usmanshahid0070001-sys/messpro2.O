#!/bin/bash
set -e

# Node.js and PM2 should already be installed from the previous run
export PATH=$HOME/node-v18.20.2-linux-x64/bin:$PATH

echo "1. Setting up and starting the Backend on Ubuntu..."
cd ~/messpro_test/backend
npm install
pm2 delete all || true
PORT=5000 MONGO_URI=mongodb://127.0.0.1:27017/messpro_test NODE_ENV=production pm2 start src/server.js --name messpro-backend

echo "Backend started on port 5000!"
echo "Server is ready to accept requests."
