class User < ApplicationRecord
  has_secure_password
  has_many :orders, dependent: :destroy

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, presence: true, length: { minimum: 6 }, on: :create
  validates :first_name, :last_name, presence: true

  # Returns the user's full name
  def full_name
    "#{first_name} #{last_name}"
  end

  # Returns the user's current cart or creates a new one
  def cart
    orders.find_by(status: 'cart') || orders.create(status: 'cart')
  end

  # Returns the user's completed orders
  def completed_orders
    orders.where(status: 'completed').order(created_at: :desc)
  end

  # Returns true if the user is an admin
  def admin?
    admin
  end
end
