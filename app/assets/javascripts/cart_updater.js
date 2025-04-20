// app/assets/javascripts/cart_updater.js

// Global function to update the cart count in the header
function updateCartCount(count) {
  // Find the cart count element in the header
  var cartCountElement = document.querySelector('.cart-count');
  
  // If the element doesn't exist, create it
  if (!cartCountElement) {
    var cartIcon = document.querySelector('a[href="/cart"] svg');
    if (cartIcon) {
      var parent = cartIcon.parentElement;
      cartCountElement = document.createElement('span');
      cartCountElement.className = 'cart-count absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-primary-600 rounded-full';
      parent.appendChild(cartCountElement);
    }
  }
  
  // Update the count or hide if zero
  if (cartCountElement) {
    if (count > 0) {
      cartCountElement.textContent = count;
      cartCountElement.style.display = 'flex';
    } else {
      cartCountElement.style.display = 'none';
    }
  }
}

// Function to fetch the current cart count from the server
function fetchCartCount() {
  fetch('/api/cart/count')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      updateCartCount(data.count);
    })
    .catch(error => {
      console.error('Error fetching cart count:', error);
    });
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add the cart-count class to the existing cart count element
  var existingCartCount = document.querySelector('a[href="/cart"] span.absolute');
  if (existingCartCount) {
    existingCartCount.classList.add('cart-count');
  }
});

// Make the functions available globally
window.CartUpdater = {
  updateCount: updateCartCount,
  fetchCount: fetchCartCount
};
