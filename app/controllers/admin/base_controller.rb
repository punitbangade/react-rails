class Admin::BaseController < ApplicationController
  before_action :require_admin
  layout 'admin'
  
  private
  
  def require_admin
    unless current_user && current_user.admin?
      flash[:danger] = "You must be an admin to access this page"
      redirect_to root_path
    end
  end
end
