class Admin::CategoriesController < Admin::BaseController
  before_action :set_category, only: [:show, :edit, :update, :destroy]
  
  def index
    @categories = Category.all.order(:name)
  end
  
  def show
    @products = @category.products.order(created_at: :desc)
  end
  
  def new
    @category = Category.new
  end
  
  def create
    @category = Category.new(category_params)
    
    if @category.save
      flash[:success] = "Category was successfully created."
      redirect_to admin_category_path(@category)
    else
      render :new
    end
  end
  
  def edit
  end
  
  def update
    if @category.update(category_params)
      flash[:success] = "Category was successfully updated."
      redirect_to admin_category_path(@category)
    else
      render :edit
    end
  end
  
  def destroy
    if @category.products.any?
      flash[:danger] = "Cannot delete category with associated products."
      redirect_to admin_category_path(@category)
    else
      @category.destroy
      flash[:success] = "Category was successfully deleted."
      redirect_to admin_categories_path
    end
  end
  
  private
  
  def set_category
    @category = Category.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    flash[:danger] = "Category not found."
    redirect_to admin_categories_path
  end
  
  def category_params
    params.require(:category).permit(:name, :description)
  end
end
