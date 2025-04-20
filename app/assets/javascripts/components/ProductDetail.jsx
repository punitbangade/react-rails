// app/assets/javascripts/components/ProductDetail.jsx
var ProductDetail = createReactClass({
  getInitialState: function() {
    return {
      product: this.props.product || null,
      loading: !this.props.product,
      error: null,
      quantity: 1,
      addingToCart: false,
      addedToCart: false,
      relatedProducts: [],
      loadingRelated: true
    };
  },

  componentDidMount: function() {
    if (!this.props.product && this.props.productId) {
      this.fetchProduct(this.props.productId);
    } else if (this.props.product) {
      this.fetchRelatedProducts(this.props.product.category_id);
    }
  },

  fetchProduct: function(productId) {
    this.setState({ loading: true });

    fetch(`/api/products/${productId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        this.setState({
          product: data,
          loading: false,
          error: null
        });

        this.fetchRelatedProducts(data.category_id);
      })
      .catch(error => {
        this.setState({
          error: 'Error fetching product: ' + error.message,
          loading: false
        });
      });
  },

  fetchRelatedProducts: function(categoryId) {
    if (!categoryId) return;

    this.setState({ loadingRelated: true });

    fetch(`/api/products?category_id=${categoryId}&limit=4`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Filter out the current product
        const relatedProducts = data.filter(p => p.id !== this.state.product.id).slice(0, 4);

        this.setState({
          relatedProducts,
          loadingRelated: false
        });
      })
      .catch(error => {
        console.error('Error fetching related products:', error);
        this.setState({ loadingRelated: false });
      });
  },

  handleQuantityChange: function(event) {
    const value = parseInt(event.target.value);
    if (value > 0 && value <= this.state.product.stock) {
      this.setState({ quantity: value });
    }
  },

  increaseQuantity: function() {
    if (this.state.quantity < this.state.product.stock) {
      this.setState({ quantity: this.state.quantity + 1 });
    }
  },

  decreaseQuantity: function() {
    if (this.state.quantity > 1) {
      this.setState({ quantity: this.state.quantity - 1 });
    }
  },

  addToCart: function() {
    if (!this.props.currentUser) {
      window.location.href = '/login';
      return;
    }

    const { product, quantity } = this.state;

    this.setState({ addingToCart: true });

    fetch('/api/orders/add_item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({
        product_id: product.id,
        quantity: quantity
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(() => {
      this.setState({
        addingToCart: false,
        addedToCart: true
      });

      // Reset added to cart status after 3 seconds
      setTimeout(() => {
        this.setState({ addedToCart: false });
      }, 3000);
    })
    .catch(error => {
      console.error('Error:', error);
      this.setState({ addingToCart: false });
      alert('Error adding product to cart. Please try again.');
    });
  },

  render: function() {
    const { product, loading, error, quantity, addingToCart, addedToCart, relatedProducts, loadingRelated } = this.state;

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

    if (!product) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Product not found</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="lg:flex">
            {/* Product Image */}
            <div className="lg:w-1/2">
              <div className="h-96 lg:h-full bg-gray-200 flex items-center justify-center">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-center object-cover"
                  />
                ) : (
                  <div className="text-center p-12">
                    <i className="fas fa-image fa-6x text-gray-400 mb-4"></i>
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="lg:w-1/2 p-8">
              <div className="mb-4">
                {product.category && (
                  <a href={`/products?category_id=${product.category.id}`} className="text-sm text-primary-600 hover:text-primary-800">
                    {product.category.name}
                  </a>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
              </div>

              <div className="mb-6">
                <p className="text-2xl font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</p>
                <div className="mt-2">
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      In Stock ({product.stock} available)
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-red-400" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-sm font-medium text-gray-900 mb-2">Description</h2>
                <div className="prose prose-sm text-gray-500">
                  <p>{product.description}</p>
                </div>
              </div>

              {product.stock > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-medium text-gray-900 mb-2">Quantity</h2>
                  <div className="flex rounded-md shadow-sm">
                    <button
                      type="button"
                      onClick={this.decreaseQuantity}
                      className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <span className="sr-only">Decrease</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="relative flex items-stretch focus-within:z-10">
                      <input
                        type="number"
                        className="block w-16 rounded-none border-gray-300 focus:ring-primary-500 focus:border-primary-500 text-center"
                        value={quantity}
                        onChange={this.handleQuantityChange}
                        min="1"
                        max={product.stock}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={this.increaseQuantity}
                      className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <span className="sr-only">Increase</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                {product.stock > 0 ? (
                  <button
                    type="button"
                    onClick={this.addToCart}
                    disabled={addingToCart}
                    className={`w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium ${
                      addingToCart
                        ? 'bg-primary-300 cursor-wait'
                        : addedToCart
                          ? 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-white'
                          : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-white'
                    }`}
                  >
                    {addingToCart ? (
                      <div>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding to Cart...
                      </div>
                    ) : addedToCart ? (
                      <div>
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Added to Cart!
                      </div>
                    ) : (
                      <div>
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        Add to Cart
                      </div>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}

                <a
                  href="/products"
                  className="w-full flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Continue Shopping
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {!loadingRelated && relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <div key={relatedProduct.id} className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-64 w-full overflow-hidden bg-gray-200 group-hover:opacity-75 transition-opacity duration-300">
                    {relatedProduct.image_url ? (
                      <img
                        src={relatedProduct.image_url}
                        alt={relatedProduct.name}
                        className="w-full h-full object-center object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="fas fa-image fa-3x text-gray-400"></i>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      <a href={`/products/${relatedProduct.id}`} className="hover:text-primary-600">
                        {relatedProduct.name}
                      </a>
                    </h3>
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      ${parseFloat(relatedProduct.price).toFixed(2)}
                    </p>
                    <a
                      href={`/products/${relatedProduct.id}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
});
