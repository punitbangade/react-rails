class UsersController < ApplicationController
  # GET /signup
  def new
    # Render signup form
    @user = User.new
    redirect_to root_path if logged_in?
  end

  # POST /signup
  def create
    @user = User.new(user_params)

    if @user.save
      # Log the user in after signup
      session[:user_id] = @user.id
      flash[:success] = "Welcome to our E-commerce Store!"
      redirect_to root_path
    else
      render 'new'
    end
  end

  private

  def user_params
    params.require(:user).permit(:first_name, :last_name, :email, :password, :password_confirmation)
  end
end
