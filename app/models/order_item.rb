class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :product

  validates :quantity, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }

  # Calculate subtotal for this item
  def subtotal
    price * quantity
  end

  # Update product stock when order is completed
  def update_stock
    product.decrease_stock(quantity) if order.completed?
  end
end
