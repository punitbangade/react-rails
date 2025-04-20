Write-Host "Building Docker images..." -ForegroundColor Green
docker-compose build

Write-Host "Starting services..." -ForegroundColor Green
docker-compose up -d

Write-Host "Waiting for database to be ready..." -ForegroundColor Green
Start-Sleep -Seconds 10

Write-Host "Creating database..." -ForegroundColor Green
docker-compose exec web bundle exec rake db:create

Write-Host "Running migrations..." -ForegroundColor Green
docker-compose exec web bundle exec rake db:migrate

Write-Host "Seeding database..." -ForegroundColor Green
docker-compose exec web bundle exec rake db:seed

Write-Host "Setup complete! Your application is running at http://localhost:3000" -ForegroundColor Green
