#!/bin/bash

# Post-pull script for Papyrus Lite
# This script runs after pulling changes to ensure the environment is up to date

set -e  # Exit on error

echo "========================================="
echo "Running post-pull setup for Papyrus Lite"
echo "========================================="

# Navigate to app directory
cd app

# Install dependencies
echo ""
echo "[1/5] Installing dependencies..."
npm install

# Navigate back to root
cd ..

# Generate Prisma client
echo ""
echo "[2/5] Generating Prisma client..."
npx prisma generate

# Run migrations
echo ""
echo "[3/5] Running database migrations..."
if [ "$NODE_ENV" = "production" ]; then
  echo "Production environment detected - using migrate deploy"
  npx prisma migrate deploy
else
  echo "Development environment detected - using migrate dev"
  npx prisma migrate dev
fi

# Clear Next.js cache
echo ""
echo "[4/5] Clearing Next.js cache..."
rm -rf app/.next
rm -rf app/node_modules/.cache

# Run seed script
echo ""
echo "[5/5] Seeding database..."
npx tsx prisma/seed.ts

echo ""
echo "========================================="
echo "✅ Post-pull setup complete!"
echo "========================================="
echo ""
echo "To start the development server:"
echo "  cd app && npm run dev"
echo ""
