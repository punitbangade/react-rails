class Admin::ProductsController < Admin::BaseController
  before_action :set_product, only: [:show, :edit, :update, :destroy]
  
  def index
    @products = Product.all.order(created_at: :desc)
  end
  
  def show
  end
  
  def new
    @product = Product.new
    @categories = Category.all
  end
  
  def create
    @product = Product.new(product_params)
    
    if @product.save
      flash[:success] = "Product was successfully created."
      redirect_to admin_product_path(@product)
    else
      @categories = Category.all
      render :new
    end
  end
  
  def edit
    @categories = Category.all
  end
  
  def update
    if @product.update(product_params)
      flash[:success] = "Product was successfully updated."
      redirect_to admin_product_path(@product)
    else
      @categories = Category.all
      render :edit
    end
  end
  
  def destroy
    @product.destroy
    flash[:success] = "Product was successfully deleted."
    redirect_to admin_products_path
  end
  
  private
  
  def set_product
    @product = Product.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    flash[:danger] = "Product not found."
    redirect_to admin_products_path
  end
  
  def product_params
    params.require(:product).permit(:name, :description, :price, :stock, :category_id, :image_url)
  end
end
