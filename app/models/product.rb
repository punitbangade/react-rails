class Product < ApplicationRecord
  belongs_to :category, optional: true
  has_many :order_items, dependent: :nullify

  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :stock, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  # Check if product is in stock
  def in_stock?
    stock > 0
  end

  # Decrease stock by given quantity
  def decrease_stock(quantity = 1)
    update(stock: stock - quantity) if stock >= quantity
  end
end
