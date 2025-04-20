# Product Images Documentation

## Overview

This document explains how product images are managed in the e-commerce application.

## Image Storage

Product images are stored in the `public/images/products` directory. Each product has a corresponding image file with the same name as the product's slug (e.g., `smartphone_x.jpg`).

## Image Format

All product images are stored in JPG format with a recommended size of 600x600 pixels. This provides a good balance between image quality and performance.

## Updating Product Images

To update product images, you can use the `bin/download_accurate_images.rb` script. This script downloads images from Unsplash and saves them to the `public/images/products` directory.

### Running the Script

```bash
# Run the script from the Docker container
docker-compose exec web ruby bin/download_accurate_images.rb
```

### Adding New Product Images

To add a new product image:

1. Add the image URL to the `product_images` hash in the `bin/download_accurate_images.rb` script
2. Run the script to download the image
3. Make sure the image filename matches the product's slug in the database

## Image URLs in the Database

Product image URLs are stored in the `image_url` column of the `products` table. The URL is a relative path to the image file (e.g., `/images/products/smartphone_x.jpg`).

## Best Practices

1. Use high-quality images with a consistent aspect ratio
2. Optimize images for web (compress without significant quality loss)
3. Use descriptive filenames that match the product name
4. Keep image sizes reasonable (under 100KB if possible)
5. Use the same dimensions for all product images for a consistent look
