class Admin::DashboardController < Admin::BaseController
  def index
    @total_products = Product.count
    @total_categories = Category.count
    @total_users = User.count
    @total_orders = Order.where.not(status: 'cart').count
    
    @recent_orders = Order.where.not(status: 'cart').order(created_at: :desc).limit(5)
    @top_products = Product.joins(:order_items)
                          .select('products.*, SUM(order_items.quantity) as total_sold')
                          .group('products.id')
                          .order('total_sold DESC')
                          .limit(5)
  end
end
