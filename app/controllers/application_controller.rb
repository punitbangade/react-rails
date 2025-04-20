class ApplicationController < ActionController::Base
  helper_method :current_user, :logged_in?

  private

  # Returns the current logged-in user (if any)
  def current_user
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end

  # Returns true if the user is logged in, false otherwise
  def logged_in?
    !current_user.nil?
  end

  # Confirms a logged-in user
  def require_login
    unless logged_in?
      flash[:danger] = "Please log in to access this page"
      redirect_to login_path
    end
  end
end
