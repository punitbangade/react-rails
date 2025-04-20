// app/assets/javascripts/components/Cart.jsx
var Cart = createReactClass({
  getInitialState: function() {
    return {
      cart: null,
      loading: true,
      error: null,
      updatingItem: null,
      removingItem: null
    };
  },

  componentDidMount: function() {
    this.fetchCart();
  },

  fetchCart: function() {
    this.setState({ loading: true });

    fetch('/api/cart')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        this.setState({
          cart: data,
          loading: false,
          error: null
        });
      })
      .catch(error => {
        this.setState({
          error: 'Error fetching cart: ' + error.message,
          loading: false
        });
      });
  },

  updateQuantity: function(itemId, quantity) {
    if (quantity < 1) return;

    this.setState({ updatingItem: itemId });

    fetch(`/api/orders/update_item/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({ quantity: quantity })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      this.setState(prevState => ({
        cart: data,
        updatingItem: null
      }));

      // Update the cart count in the header
      if (window.CartUpdater && typeof window.CartUpdater.updateCount === 'function') {
        const totalItems = data.order_items.reduce((sum, item) => sum + item.quantity, 0);
        window.CartUpdater.updateCount(totalItems);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      this.setState({ updatingItem: null });
      alert('Error updating item. Please try again.');
    });
  },

  removeItem: function(itemId) {
    this.setState({ removingItem: itemId });

    fetch(`/api/orders/remove_item/${itemId}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      this.setState({
        cart: data,
        removingItem: null
      });

      // Update the cart count in the header
      if (window.CartUpdater && typeof window.CartUpdater.updateCount === 'function') {
        const totalItems = data.order_items.reduce((sum, item) => sum + item.quantity, 0);
        window.CartUpdater.updateCount(totalItems);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      this.setState({ removingItem: null });
      alert('Error removing item. Please try again.');
    });
  },

  render: function() {
    const { cart, loading, error, updatingItem, removingItem } = this.state;

    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    if (!cart || !cart.order_items || cart.order_items.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
            <a href="/products" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Continue Shopping
              <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Your Shopping Cart</h1>
        </div>

        <div className="divide-y divide-gray-200">
          {cart.order_items.map(item => (
            <div key={item.id} className={`p-6 ${removingItem === item.id ? 'opacity-50' : ''}`}>
              <div className="flex flex-col md:flex-row">
                <div className="flex-shrink-0 w-full md:w-32 h-32 bg-gray-200 rounded-md overflow-hidden">
                  {item.product.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-center object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="fas fa-image fa-2x text-gray-400"></i>
                    </div>
                  )}
                </div>

                <div className="flex-1 md:ml-6 mt-4 md:mt-0">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        <a href={`/products/${item.product.id}`} className="hover:text-primary-600">
                          {item.product.name}
                        </a>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.product.description}</p>
                    </div>
                    <p className="text-lg font-medium text-gray-900">${parseFloat(item.price).toFixed(2)}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <label htmlFor={`quantity-${item.id}`} className="sr-only">Quantity</label>
                      <div className="flex rounded-md shadow-sm">
                        <button
                          type="button"
                          onClick={() => this.updateQuantity(item.id, item.quantity - 1)}
                          disabled={updatingItem === item.id || item.quantity <= 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <span className="sr-only">Decrease</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <div className="relative flex items-stretch focus-within:z-10">
                          <input
                            type="number"
                            id={`quantity-${item.id}`}
                            className="block w-16 rounded-none border-gray-300 focus:ring-primary-500 focus:border-primary-500 text-center"
                            value={item.quantity}
                            readOnly
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => this.updateQuantity(item.id, item.quantity + 1)}
                          disabled={updatingItem === item.id}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <span className="sr-only">Increase</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      {updatingItem === item.id && (
                        <svg className="animate-spin ml-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                    </div>

                    <div className="flex items-center">
                      <p className="text-lg font-medium text-gray-900 mr-4">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        type="button"
                        onClick={() => this.removeItem(item.id)}
                        disabled={removingItem === item.id}
                        className="text-gray-400 hover:text-red-500 focus:outline-none"
                      >
                        <span className="sr-only">Remove</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
            <p>Subtotal</p>
            <p>${parseFloat(cart.total).toFixed(2)}</p>
          </div>
          <div className="flex justify-between text-base font-medium text-gray-500 mb-2">
            <p>Shipping</p>
            <p>Free</p>
          </div>
          <div className="flex justify-between text-base font-medium text-gray-500 mb-4">
            <p>Tax (10%)</p>
            <p>${(parseFloat(cart.total) * 0.1).toFixed(2)}</p>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
            <p>Total</p>
            <p>${(parseFloat(cart.total) * 1.1).toFixed(2)}</p>
          </div>

          <div className="mt-6">
            <a
              href="/checkout"
              className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Proceed to Checkout
              <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>

          <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
            <p>
              or <a href="/products" className="text-primary-600 font-medium hover:text-primary-500">Continue Shopping<span aria-hidden="true"> &rarr;</span></a>
            </p>
          </div>
        </div>
      </div>
    );
  }
});
