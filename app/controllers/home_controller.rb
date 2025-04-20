class HomeController < ApplicationController
  before_action :require_login, only: [:cart, :checkout, :orders, :order_detail]

  def index
    # Home page with featured products
    @featured_products = Product.order(created_at: :desc).limit(4)
  end

  def products
    # Products listing page
    @category = Category.find(params[:category_id]) if params[:category_id].present?
  end

  def product_detail
    # Product detail page
    @product = Product.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to products_path, alert: "Product not found"
  end

  def cart
    # Shopping cart page
  end

  def checkout
    # Checkout page
    @order = current_user.orders.find_by(status: 'cart')
    redirect_to cart_path, alert: "Your cart is empty" if @order.nil? || @order.order_items.empty?
  end

  def orders
    # Order history page
  end

  def order_detail
    # Order detail page
    @order = current_user.orders.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to orders_path, alert: "Order not found"
  end
end
