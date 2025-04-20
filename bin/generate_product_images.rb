#!/usr/bin/env ruby
require 'fileutils'

# Create directory if it doesn't exist
FileUtils.mkdir_p('public/images/products')

# Define product names and colors
products = {
  'smartphone_x' => '#3498db',         # Blue
  'laptop_pro' => '#2ecc71',           # Green
  'wireless_headphones' => '#e74c3c',  # Red
  'mens_t_shirt' => '#9b59b6',         # Purple
  'womens_jeans' => '#1abc9c',         # Turquoise
  'running_shoes' => '#f1c40f',        # Yellow
  'coffee_maker' => '#e67e22',         # Orange
  'blender' => '#34495e',              # Dark Blue
  'bedding_set' => '#95a5a6',          # Gray
  'programming_guide' => '#16a085',    # Green
  'sci_fi_novel' => '#8e44ad',         # Purple
  'cookbook' => '#d35400',             # Orange
  'yoga_mat' => '#27ae60',             # Green
  'camping_tent' => '#2980b9',         # Blue
  'basketball' => '#f39c12'            # Orange
}

# Generate SVG images for each product
products.each do |product_name, color|
  output_path = "public/images/products/#{product_name}.svg"
  
  # Skip if file already exists
  if File.exist?(output_path)
    puts "Skipping #{product_name}, file already exists"
    next
  end
  
  # Create a simple SVG with the product name and color
  svg_content = <<~SVG
    <?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="300" fill="#{color}" />
      <text x="150" y="150" font-family="Arial" font-size="24" text-anchor="middle" dominant-baseline="middle" fill="white">#{product_name.gsub('_', ' ').capitalize}</text>
    </svg>
  SVG
  
  # Write the SVG file
  File.write(output_path, svg_content)
  puts "Generated image for #{product_name}"
end

# Create an HTML file to view all product images
html_content = <<~HTML
  <!DOCTYPE html>
  <html>
  <head>
    <title>Product Images</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
      .product-card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
      .product-image { width: 100%; height: 300px; object-fit: cover; }
      .product-name { padding: 10px; text-align: center; font-weight: bold; }
    </style>
  </head>
  <body>
    <h1>Product Images</h1>
    <div class="product-grid">
HTML

products.each do |product_name, _|
  display_name = product_name.gsub('_', ' ').split.map(&:capitalize).join(' ')
  html_content += <<~HTML
      <div class="product-card">
        <img src="#{product_name}.svg" alt="#{display_name}" class="product-image">
        <div class="product-name">#{display_name}</div>
      </div>
  HTML
end

html_content += <<~HTML
    </div>
  </body>
  </html>
HTML

# Write the HTML file
File.write('public/images/products/index.html', html_content)

puts "Generated product images and preview page at public/images/products/index.html"
