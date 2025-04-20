# E-Commerce Application

Repository: https://github.com/punitbangade/react-rails.git

## Technology Stack

- **Backend**: Ruby on Rails 5.2
- **Frontend**: React.js
- **Database**: PostgreSQL
- **Containerization**: Docker and Docker Compose

## Prerequisites

### Docker Setup
- Docker (19.03.0+)
- Docker Compose (1.27.0+)

### Local Setup
- Ruby (2.7.8)
- Rails (5.2.8)
- Node.js (14.x+)
- Yarn
- PostgreSQL (12.x+)

## Setup Instructions

### Docker Setup

```bash
# Clone repository
git clone https://github.com/punitbangade/react-rails.git
cd react-rails

# Build and start containers
docker-compose build
docker-compose up -d

# Set up database
docker-compose exec web bundle exec rake db:create db:migrate db:seed

# Access application at http://localhost:3000
# Admin access: admin@example.com / password

# Stop application
docker-compose down
```

### Local Setup

```bash
# Clone repository
git clone https://github.com/punitbangade/react-rails.git
cd react-rails

# Install dependencies
bundle install
yarn install

# Set up database
rails db:create db:migrate db:seed

# Start server
rails server

# Optional: Start Webpack dev server in another terminal
./bin/webpack-dev-server

# Access application at http://localhost:3000
# Admin access: admin@example.com / password
```

## Development Commands

### Running Tests

```bash
# Docker
docker-compose exec web bundle exec rspec

# Local
bundle exec rspec
```

### Rails Console

```bash
# Docker
docker-compose exec web bundle exec rails console

# Local
rails console
```

### After Code Changes

```bash
# Docker - After Gemfile/package.json changes
docker-compose down
docker-compose build
docker-compose up -d

# Local - After Gemfile changes
bundle install

# Local - After package.json changes
yarn install

# Local - After schema changes
rails db:migrate
```

### Default Credentials

```
Admin: admin@example.com / password
User: user@example.com / password
```

## Troubleshooting

```bash
# Docker - Check container status
docker-compose ps

# Docker - View logs
docker-compose logs web

# Docker - Rebuild containers
docker-compose down && docker-compose build && docker-compose up -d

# Local - Check Ruby version
ruby -v  # Should be 2.7.8

# Local - Check database connection
rails db:version

# Both - Precompile assets
# Docker
docker-compose exec web bundle exec rake assets:precompile
# Local
bundle exec rake assets:precompile
```
