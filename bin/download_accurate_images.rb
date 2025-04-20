#!/usr/bin/env ruby
require 'open-uri'
require 'fileutils'

# Create directory if it doesn't exist
FileUtils.mkdir_p('public/images/products')

# Define product images with accurate URLs
product_images = {
  'smartphone_x.jpg' => 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop',
  'laptop_pro.jpg' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600&auto=format&fit=crop',
  'wireless_headphones.jpg' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
  'mens_t_shirt.jpg' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop',
  'womens_jeans.jpg' => 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop',
  'running_shoes.jpg' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
  'coffee_maker.jpg' => 'https://images.unsplash.com/photo-1572119865084-43c285814d63?q=80&w=600&auto=format&fit=crop',
  'blender.jpg' => 'https://images.unsplash.com/photo-1622480916113-9000ac49b79d?q=80&w=600&auto=format&fit=crop',
  'bedding_set.jpg' => 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&auto=format&fit=crop',
  'programming_guide.jpg' => 'https://images.unsplash.com/photo-1532622785990-d2c36a76f5a6?q=80&w=600&auto=format&fit=crop',
  'sci_fi_novel.jpg' => 'https://images.unsplash.com/photo-1518744386442-2d48ac47a7eb?q=80&w=600&auto=format&fit=crop',
  'cookbook.jpg' => 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?q=80&w=600&auto=format&fit=crop',
  'yoga_mat.jpg' => 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=600&auto=format&fit=crop',
  'camping_tent.jpg' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop',
  'basketball.jpg' => 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=600&auto=format&fit=crop'
}

# Download each image
product_images.each do |filename, url|
  puts "Downloading #{filename}..."
  begin
    path = "public/images/products/#{filename}"

    # Download the image
    URI.open(url) do |image|
      File.open(path, "wb") do |file|
        file.write(image.read)
      end
    end

    puts "Successfully downloaded #{filename}"
  rescue => e
    puts "Error downloading #{filename}: #{e.message}"
  end
end

puts "All images downloaded successfully!"
