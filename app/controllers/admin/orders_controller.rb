class Admin::OrdersController < Admin::BaseController
  before_action :set_order, only: [:show, :update]
  
  def index
    @orders = Order.where.not(status: 'cart').order(created_at: :desc)
    
    if params[:status].present?
      @orders = @orders.where(status: params[:status])
    end
  end
  
  def show
    @order_items = @order.order_items.includes(:product)
  end
  
  def update
    if @order.update(order_params)
      flash[:success] = "Order status was successfully updated."
      redirect_to admin_order_path(@order)
    else
      flash[:danger] = "Failed to update order status."
      redirect_to admin_order_path(@order)
    end
  end
  
  private
  
  def set_order
    @order = Order.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    flash[:danger] = "Order not found."
    redirect_to admin_orders_path
  end
  
  def order_params
    params.require(:order).permit(:status)
  end
end
