FROM ruby:2.7.8

# Install dependencies
RUN apt-get update -qq && apt-get install -y \
    build-essential \
    libpq-dev \
    nodejs \
    npm \
    dos2unix \
    imagemagick

# Set working directory
WORKDIR /app

# Install bundler
RUN gem install bundler:2.3.26

# Copy Gemfile and Gemfile.lock
COPY Gemfile Gemfile.lock ./

# Install gems
RUN bundle install

# Copy the rest of the application
COPY . .

# Fix line endings for scripts
RUN find ./bin -type f -exec dos2unix {} \;

# Precompile assets
RUN bundle exec rake assets:precompile

# Expose port 3000
EXPOSE 3000

# Start the Rails server
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
