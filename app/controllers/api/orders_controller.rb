class Api::OrdersController < ApplicationController
  # Skip CSRF protection for API endpoints
  skip_before_action :verify_authenticity_token
  before_action :require_login

  # GET /api/orders/cart
  def cart
    @order = current_user.orders.find_by(status: 'cart') || current_user.orders.create(status: 'cart')
    render json: @order.as_json(include: { order_items: { include: :product } })
  end

  # GET /api/cart/count
  def cart_count
    @order = current_user.orders.find_by(status: 'cart')
    count = @order ? @order.order_items.sum(:quantity) : 0
    render json: { count: count }
  end

  # POST /api/orders
  def create
    @order = current_user.orders.find_by(status: 'cart')

    if @order.nil?
      render json: { error: 'No cart found' }, status: :not_found
      return
    end

    # Update order with shipping and billing information
    @order.shipping_address = params[:shipping_address].to_json if params[:shipping_address]
    @order.billing_address = params[:billing_address].to_json if params[:billing_address]
    @order.payment_method = params[:payment_method] if params[:payment_method]

    # Update order status to pending
    if @order.update(status: 'pending')
      # Create a new empty cart
      current_user.orders.create(status: 'cart')

      render json: @order, status: :created
    else
      render json: @order.errors, status: :unprocessable_entity
    end
  end

  # GET /api/orders/:id
  def show
    @order = current_user.orders.find(params[:id])
    render json: @order.as_json(include: { order_items: { include: :product } })
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Order not found' }, status: :not_found
  end

  # POST /api/orders/add_item
  def add_item
    @order = current_user.orders.find_by(status: 'cart') || current_user.orders.create(status: 'cart')
    @product = Product.find(params[:product_id])
    quantity = params[:quantity].to_i || 1

    if @product.in_stock?
      @order_item = @order.add_product(@product, quantity)
      total_items = @order.order_items.sum(:quantity)
      render json: @order.as_json(include: { order_items: { include: :product } }).merge(total_items: total_items), status: :created
    else
      render json: { error: 'Product out of stock' }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Product not found' }, status: :not_found
  end

  # DELETE /api/orders/remove_item/:id
  def remove_item
    @order = current_user.orders.find_by(status: 'cart')
    @order_item = @order.order_items.find(params[:id])

    if @order_item.destroy
      @order.calculate_total
      render json: @order.as_json(include: { order_items: { include: :product } })
    else
      render json: { error: 'Could not remove item' }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Item not found' }, status: :not_found
  end

  # PATCH /api/orders/update_item/:id
  def update_item
    @order = current_user.orders.find_by(status: 'cart')
    @order_item = @order.order_items.find(params[:id])
    quantity = params[:quantity].to_i

    if quantity > 0 && quantity <= @order_item.product.stock
      if @order_item.update(quantity: quantity)
        @order.calculate_total
        render json: @order.as_json(include: { order_items: { include: :product } })
      else
        render json: { error: 'Could not update item' }, status: :unprocessable_entity
      end
    else
      render json: { error: 'Invalid quantity' }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Item not found' }, status: :not_found
  end
end
