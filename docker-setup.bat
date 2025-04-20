@echo off
echo Building Docker images...
docker-compose build

echo Starting services...
docker-compose up -d

echo Waiting for database to be ready...
timeout /t 10 /nobreak > nul

echo Creating database...
docker-compose exec web bundle exec rake db:create

echo Running migrations...
docker-compose exec web bundle exec rake db:migrate

echo Seeding database...
docker-compose exec web bundle exec rake db:seed

echo Setup complete! Your application is running at http://localhost:3000
