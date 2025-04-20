class Admin::UsersController < Admin::BaseController
  before_action :set_user, only: [:show, :edit, :update, :toggle_admin]

  def index
    @users = User.all.order(created_at: :desc)
  end

  def show
    @orders = @user.orders.where.not(status: 'cart').order(created_at: :desc)
  end

  def edit
  end

  def update
    if @user.update(user_params)
      flash[:success] = "User was successfully updated."
      redirect_to admin_user_path(@user)
    else
      render :edit
    end
  end

  def toggle_admin
    @user.update(admin: !@user.admin)
    flash[:success] = "Admin status updated for #{@user.full_name}."
    redirect_to admin_user_path(@user)
  end

  def update
    if params[:admin].present?
      @user.update(admin: params[:admin] == 'true')
      flash[:success] = "Admin status updated for #{@user.full_name}."
      redirect_to admin_user_path(@user)
    elsif @user.update(user_params)
      flash[:success] = "User was successfully updated."
      redirect_to admin_user_path(@user)
    else
      render :edit
    end
  end

  private

  def set_user
    @user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    flash[:danger] = "User not found."
    redirect_to admin_users_path
  end

  def user_params
    params.require(:user).permit(:first_name, :last_name, :email)
  end
end
