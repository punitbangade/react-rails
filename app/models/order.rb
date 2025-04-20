class Order < ApplicationRecord
  belongs_to :user
  has_many :order_items, dependent: :destroy

  validates :status, presence: true
  validates :total, presence: true, numericality: { greater_than_or_equal_to: 0 }

  # Order statuses
  enum status: {
    cart: 'cart',
    pending: 'pending',
    processing: 'processing',
    completed: 'completed',
    cancelled: 'cancelled'
  }

  # Calculate total from order items
  def calculate_total
    self.total = order_items.sum { |item| item.price * item.quantity }
    save
  end

  # Add product to order
  def add_product(product, quantity = 1)
    current_item = order_items.find_by(product_id: product.id)

    if current_item
      current_item.quantity += quantity
      current_item.save
    else
      current_item = order_items.create(
        product: product,
        quantity: quantity,
        price: product.price
      )
    end

    calculate_total
    current_item
  end
end
