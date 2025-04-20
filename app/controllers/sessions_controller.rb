class SessionsController < ApplicationController
  # GET /login
  def new
    # Render login form
    redirect_to root_path if logged_in?
  end

  # POST /login
  def create
    user = User.find_by(email: params[:session][:email].downcase)

    if user && user.authenticate(params[:session][:password])
      # Log the user in and redirect to the home page
      session[:user_id] = user.id
      flash[:success] = "Successfully logged in!"
      redirect_to root_path
    else
      # Create an error message
      flash.now[:danger] = "Invalid email/password combination"
      render 'new'
    end
  end

  # DELETE /logout
  def destroy
    session.delete(:user_id)
    @current_user = nil
    flash[:success] = "Successfully logged out!"
    redirect_to root_path
  end
end
