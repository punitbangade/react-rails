Rails.configuration.stripe = {
  publishable_key: ENV['STRIPE_PUBLISHABLE_KEY'] || 'pk_test_sample',
  secret_key: ENV['STRIPE_SECRET_KEY'] || 'sk_test_sample'
}

Stripe.api_key = Rails.configuration.stripe[:secret_key]
