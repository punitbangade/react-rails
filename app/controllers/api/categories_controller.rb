class Api::CategoriesController < ApplicationController
  # Skip CSRF protection for API endpoints
  skip_before_action :verify_authenticity_token

  # GET /api/categories
  def index
    @categories = Category.all
    render json: @categories
  end
end
