#!/bin/bash

# Save the current directory
current_dir=$(pwd)

# Say hi to the user
echo "👷🏻‍♂️ Hello! I'm your friendly contractor Byggare Bob and I'll be building your project. Let's get started!"

# Build the backend
echo "🔨 Building the backend..."
cd "$current_dir/backend"
npm run build
echo "✅ Backend built successfully!"

# Build the frontend
echo "🔨 Building the frontend..."
cd "$current_dir/frontend"
npm run build
echo "✅ Frontend built successfully!"

# Copy the Prisma query engine to the backend dist folder
echo "📦 Copying Prisma query engine to the backend dist folder..."
cp "$current_dir/backend/generated/prisma/libquery_engine-debian-openssl-3.0.x.so.node" "$current_dir/backend/dist"
echo "✅ Prisma query engine copied successfully!"

# Return to the original directory
cd "$current_dir"
echo "🎉 All done! Your project has been built successfully. You can now run the backend which serves the frontend. Have a great day! 👷🏻‍♂️"
