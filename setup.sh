#!/bin/bash

echo "🚀 CharismaAI Setup - Unix/Linux/Mac"
echo ""
echo "Starting setup script..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Make the script executable if it isn't already
chmod +x setup.js

# Run the setup script
node setup.js 