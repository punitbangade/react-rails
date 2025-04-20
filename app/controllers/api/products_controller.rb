class Api::ProductsController < ApplicationController
  # Skip CSRF protection for API endpoints
  skip_before_action :verify_authenticity_token

  # GET /api/products
  def index
    @products = Product.all

    # Filter by category
    if params[:category_id].present?
      @products = @products.where(category_id: params[:category_id])
    end

    # Filter by price range
    if params[:min_price].present?
      @products = @products.where('price >= ?', params[:min_price])
    end

    if params[:max_price].present?
      @products = @products.where('price <= ?', params[:max_price])
    end

    # Search by name or description
    if params[:search].present?
      search_term = "%#{params[:search]}%"
      @products = @products.where('name ILIKE ? OR description ILIKE ?', search_term, search_term)
    end

    # Sorting
    sort_column = params[:sort] || 'created_at'
    sort_direction = params[:order] || 'desc'

    # Validate sort column to prevent SQL injection
    valid_columns = ['name', 'price', 'created_at']
    sort_column = 'created_at' unless valid_columns.include?(sort_column)

    # Validate sort direction
    sort_direction = sort_direction.downcase == 'asc' ? 'asc' : 'desc'

    @products = @products.order("#{sort_column} #{sort_direction}")

    # Get featured products (newest products)
    if params[:featured].present? && params[:featured] == 'true'
      @products = @products.order(created_at: :desc).limit(4)
    end

    render json: @products
  end

  # GET /api/products/:id
  def show
    @product = Product.find(params[:id])
    render json: @product
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Product not found' }, status: :not_found
  end
end
