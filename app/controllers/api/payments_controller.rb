class Api::PaymentsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :require_login
  
  # POST /api/payments/process
  def process_payment
    # Get the current cart
    @order = current_user.orders.find_by(status: 'cart')
    
    if @order.nil? || @order.order_items.empty?
      render json: { error: 'No items in cart' }, status: :unprocessable_entity
      return
    end
    
    # Calculate the amount in cents
    amount = (@order.total * 100).to_i
    
    begin
      # Create a customer in Stripe
      customer = Stripe::Customer.create({
        email: params[:email],
        source: params[:token]
      })
      
      # Create a charge
      charge = Stripe::Charge.create({
        customer: customer.id,
        amount: amount,
        description: "Order ##{@order.id}",
        currency: 'usd'
      })
      
      # Update order with payment details and change status
      @order.update(
        status: 'processing',
        payment_id: charge.id,
        payment_method: 'credit_card',
        shipping_address: params[:shipping_address],
        billing_address: params[:billing_address]
      )
      
      # Create a new empty cart for the user
      current_user.orders.create(status: 'cart')
      
      render json: @order, status: :ok
    rescue Stripe::CardError => e
      render json: { error: e.message }, status: :payment_required
    rescue Stripe::StripeError => e
      render json: { error: e.message }, status: :unprocessable_entity
    rescue => e
      render json: { error: e.message }, status: :internal_server_error
    end
  end
end
