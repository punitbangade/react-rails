# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).

# Clear existing data
OrderItem.destroy_all
Order.destroy_all
Product.destroy_all
Category.destroy_all
User.destroy_all

# Create admin user
admin = User.create!(
  first_name: 'Admin',
  last_name: 'User',
  email: 'admin@example.com',
  password: 'password',
  password_confirmation: 'password',
  admin: true
)

puts "Created admin user: #{admin.email}"

# Create regular user
user = User.create!(
  first_name: 'John',
  last_name: 'Doe',
  email: 'user@example.com',
  password: 'password',
  password_confirmation: 'password'
)

puts "Created regular user: #{user.email}"

# Create categories
categories = [
  { name: 'Electronics', description: 'Electronic devices and gadgets' },
  { name: 'Clothing', description: 'Apparel and fashion items' },
  { name: 'Home & Kitchen', description: 'Products for your home' },
  { name: 'Books', description: 'Books, e-books, and audiobooks' },
  { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' }
]

created_categories = categories.map do |category_data|
  Category.create!(category_data)
end

puts "Created #{created_categories.size} categories"

# Create products
products = [
  {
    name: 'Smartphone X',
    description: 'Latest smartphone with advanced features and high-resolution camera.',
    price: 699.99,
    stock: 50,
    category: created_categories[0], # Electronics
    image_url: '/images/products/smartphone_x.jpg'
  },
  {
    name: 'Laptop Pro',
    description: 'Powerful laptop for professionals with high performance and long battery life.',
    price: 1299.99,
    stock: 25,
    category: created_categories[0], # Electronics
    image_url: '/images/products/laptop_pro.jpg'
  },
  {
    name: 'Wireless Headphones',
    description: 'Premium wireless headphones with noise cancellation and crystal clear sound.',
    price: 199.99,
    stock: 100,
    category: created_categories[0], # Electronics
    image_url: '/images/products/wireless_headphones.jpg'
  },
  {
    name: 'Men\'s T-Shirt',
    description: 'Comfortable cotton t-shirt for everyday wear.',
    price: 24.99,
    stock: 200,
    category: created_categories[1], # Clothing
    image_url: '/images/products/mens_t_shirt.jpg'
  },
  {
    name: 'Women\'s Jeans',
    description: 'Stylish and durable jeans for women.',
    price: 49.99,
    stock: 150,
    category: created_categories[1], # Clothing
    image_url: '/images/products/womens_jeans.jpg'
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight and comfortable running shoes for athletes.',
    price: 89.99,
    stock: 75,
    category: created_categories[1], # Clothing
    image_url: '/images/products/running_shoes.jpg'
  },
  {
    name: 'Coffee Maker',
    description: 'Automatic coffee maker with timer and multiple brewing options.',
    price: 79.99,
    stock: 40,
    category: created_categories[2], # Home & Kitchen
    image_url: '/images/products/coffee_maker.jpg'
  },
  {
    name: 'Blender',
    description: 'High-powered blender for smoothies and food preparation.',
    price: 59.99,
    stock: 60,
    category: created_categories[2], # Home & Kitchen
    image_url: '/images/products/blender.jpg'
  },
  {
    name: 'Bedding Set',
    description: 'Luxurious bedding set with sheets, pillowcases, and duvet cover.',
    price: 129.99,
    stock: 30,
    category: created_categories[2], # Home & Kitchen
    image_url: '/images/products/bedding_set.jpg'
  },
  {
    name: 'Programming Guide',
    description: 'Comprehensive guide to modern programming languages and techniques.',
    price: 34.99,
    stock: 100,
    category: created_categories[3], # Books
    image_url: '/images/products/programming_guide.jpg'
  },
  {
    name: 'Science Fiction Novel',
    description: 'Bestselling science fiction novel set in a distant future.',
    price: 19.99,
    stock: 200,
    category: created_categories[3], # Books
    image_url: '/images/products/sci_fi_novel.jpg'
  },
  {
    name: 'Cookbook',
    description: 'Collection of delicious recipes from around the world.',
    price: 29.99,
    stock: 80,
    category: created_categories[3], # Books
    image_url: '/images/products/cookbook.jpg'
  },
  {
    name: 'Yoga Mat',
    description: 'Non-slip yoga mat for comfortable practice.',
    price: 39.99,
    stock: 120,
    category: created_categories[4], # Sports & Outdoors
    image_url: '/images/products/yoga_mat.jpg'
  },
  {
    name: 'Camping Tent',
    description: 'Durable and waterproof tent for outdoor adventures.',
    price: 149.99,
    stock: 35,
    category: created_categories[4], # Sports & Outdoors
    image_url: '/images/products/camping_tent.jpg'
  },
  {
    name: 'Basketball',
    description: 'Official size and weight basketball for indoor and outdoor play.',
    price: 29.99,
    stock: 90,
    category: created_categories[4], # Sports & Outdoors
    image_url: '/images/products/basketball.jpg'
  }
]

created_products = products.map do |product_data|
  Product.create!(product_data)
end

puts "Created #{created_products.size} products"

# Create a sample order for the user
cart = user.orders.create!(status: 'cart')

# Add some items to the cart
cart.add_product(created_products[0], 1) # Smartphone X
cart.add_product(created_products[6], 2) # Coffee Maker

puts "Created sample cart with #{cart.order_items.count} items for #{user.email}"

# Create a completed order for the user
completed_order = user.orders.create!(status: 'completed')
completed_order.add_product(created_products[2], 1) # Wireless Headphones
completed_order.add_product(created_products[9], 1) # Programming Guide

puts "Created completed order with #{completed_order.order_items.count} items for #{user.email}"
