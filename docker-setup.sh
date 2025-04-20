#!/bin/bash

# Exit on error
set -e

# Build the Docker images
echo "Building Docker images..."
docker-compose build

# Start the services in the background
echo "Starting services..."
docker-compose up -d

# Wait for the database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Create the database if it doesn't exist
echo "Creating database..."
docker-compose exec web bundle exec rake db:create

# Run migrations
echo "Running migrations..."
docker-compose exec web bundle exec rake db:migrate

# Seed the database
echo "Seeding database..."
docker-compose exec web bundle exec rake db:seed

echo "Setup complete! Your application is running at http://localhost:3000"
