// app/assets/javascripts/components/Home.jsx
var Home = createReactClass({
  getInitialState: function() {
    return {
      featuredProducts: this.props.featuredProducts || [],
      loading: !this.props.featuredProducts,
      error: null
    };
  },

  componentDidMount: function() {
    if (!this.props.featuredProducts) {
      this.fetchFeaturedProducts();
    }
  },

  fetchFeaturedProducts: function() {
    this.setState({ loading: true });

    fetch('/api/products?featured=true')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        this.setState({
          featuredProducts: data,
          loading: false,
          error: null
        });
      })
      .catch(error => {
        this.setState({
          error: 'Error fetching featured products: ' + error.message,
          loading: false
        });
      });
  },

  addToCart: function(productId) {
    if (!this.props.currentUser) {
      window.location.href = '/login';
      return;
    }

    this.setState(prevState => ({
      featuredProducts: prevState.featuredProducts.map(product =>
        product.id === productId ? { ...product, isAddingToCart: true } : product
      )
    }));

    fetch('/api/orders/add_item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: 1
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(() => {
      // Show success notification instead of alert
      this.setState(prevState => ({
        featuredProducts: prevState.featuredProducts.map(product =>
          product.id === productId ? { ...product, isAddingToCart: false, addedToCart: true } : product
        )
      }));

      // Reset the added to cart status after 3 seconds
      setTimeout(() => {
        this.setState(prevState => ({
          featuredProducts: prevState.featuredProducts.map(product =>
            product.id === productId ? { ...product, addedToCart: false } : product
          )
        }));
      }, 3000);
    })
    .catch(error => {
      console.error('Error:', error);
      this.setState(prevState => ({
        featuredProducts: prevState.featuredProducts.map(product =>
          product.id === productId ? { ...product, isAddingToCart: false, error: 'Failed to add to cart' } : product
        )
      }));

      // Reset the error status after 3 seconds
      setTimeout(() => {
        this.setState(prevState => ({
          featuredProducts: prevState.featuredProducts.map(product =>
            product.id === productId ? { ...product, error: null } : product
          )
        }));
      }, 3000);
    });
  },

  render: function() {
    const { featuredProducts, loading, error } = this.state;

    return (
      <div>
        {/* Modern Hero Section */}
        <div className="relative overflow-hidden mb-16">
          {/* Background with animated gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 animate-gradient-x"></div>

          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full">
              <svg className="absolute left-0 top-0 h-64 w-64 text-white opacity-20" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M44.6,-76.9C59.3,-70.2,73.8,-60.5,81.5,-46.9C89.2,-33.3,90.1,-16.7,88.9,-0.7C87.6,15.3,84.2,30.5,76.2,43.2C68.3,55.9,55.7,66,41.6,71.5C27.4,77,13.7,77.8,-0.2,78.1C-14.1,78.4,-28.1,78.2,-41.1,72.6C-54.1,67,-66,56,-73.4,42.3C-80.9,28.6,-83.9,12.3,-83.2,-3.9C-82.5,-20.1,-78.1,-36.3,-68.9,-48.6C-59.6,-60.9,-45.5,-69.3,-31.3,-76.2C-17.1,-83.1,-2.8,-88.5,10.2,-86.1C23.3,-83.7,30,-83.6,44.6,-76.9Z" transform="translate(100 100)" />
              </svg>
              <svg className="absolute right-0 bottom-0 h-64 w-64 text-white opacity-20" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M39.5,-67.2C52.9,-60.3,66.8,-52.8,75.2,-40.5C83.6,-28.2,86.4,-11.2,83.9,4.4C81.4,20,73.6,34.3,63.3,45.9C53,57.5,40.2,66.5,26.1,71.8C12,77.2,-3.5,78.9,-17.8,75.2C-32.1,71.5,-45.3,62.3,-56.3,50.5C-67.3,38.7,-76.2,24.2,-79.2,8.3C-82.2,-7.6,-79.3,-25,-71.4,-39.4C-63.5,-53.8,-50.5,-65.2,-36.4,-71.7C-22.3,-78.2,-7.1,-79.8,7.2,-78.8C21.5,-77.8,26.1,-74.1,39.5,-67.2Z" transform="translate(100 100)" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="relative px-6 py-24 sm:px-12 sm:py-32 lg:py-40 lg:px-16 flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-12 md:mb-0 z-10">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl mb-2">
                <span className="block text-white opacity-90">Discover</span>
                <span className="block text-white">Shop <span className="text-yellow-300">Smarter</span></span>
              </h1>
              <p className="mt-6 max-w-lg text-xl text-white text-opacity-80 sm:max-w-3xl">
                Explore our curated collection of premium products at competitive prices. Your perfect shopping experience starts here.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a href="/products" className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-indigo-900 bg-white hover:bg-gray-100 transition duration-300 ease-in-out transform hover:-translate-y-1">
                  <span>Shop Now</span>
                  <svg className="ml-3 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="/products" className="inline-flex items-center px-8 py-4 border border-white text-base font-medium rounded-full text-white hover:bg-white hover:bg-opacity-10 transition duration-300 ease-in-out">
                  <span>View Categories</span>
                </a>
              </div>
            </div>

            {/* Hero image */}
            <div className="md:w-1/2 flex justify-center z-10">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="relative bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl p-6 border border-white border-opacity-20 shadow-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    {featuredProducts.slice(0, 4).map((product) => (
                      <div key={product.id} className="aspect-w-1 aspect-h-1 overflow-hidden rounded-xl">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="object-cover w-full h-full transform transition duration-500 hover:scale-110"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-white text-opacity-90 font-medium">Featured Products</div>
                    <div className="flex space-x-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-white bg-opacity-40'}`}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Products */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <a href="/products" className="text-primary-600 hover:text-primary-800 flex items-center">
              View all
              <svg className="ml-1 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </a>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : error ? (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.length > 0 ? (
                featuredProducts.map(product => (
                  <div key={product.id} className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-80 w-full overflow-hidden bg-gray-200 group-hover:opacity-75 transition-opacity duration-300">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-center object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fas fa-image fa-4x text-gray-400"></i>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        <a href={`/products/${product.id}`} className="hover:text-primary-600">
                          {product.name}
                        </a>
                      </h3>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-gray-900">
                          ${parseFloat(product.price).toFixed(2)}
                        </p>
                        {product.stock > 0 ? (
                          <div>
                            {product.isAddingToCart ? (
                              <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 cursor-wait" disabled>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adding...
                              </button>
                            ) : product.addedToCart ? (
                              <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100">
                                <svg className="-ml-1 mr-2 h-4 w-4 text-green-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Added!
                              </button>
                            ) : product.error ? (
                              <button
                                onClick={() => this.addToCart(product.id)}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                              >
                                <svg className="-ml-1 mr-2 h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Try Again
                              </button>
                            ) : (
                              <button
                                onClick={() => this.addToCart(product.id)}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out"
                              >
                                <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                </svg>
                                Add to Cart
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">No featured products available at the moment. Check back soon!</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Categories Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative h-40 bg-gradient-to-r from-blue-500 to-blue-600">
                <div className="absolute inset-0 flex items-center justify-center opacity-25">
                  <svg className="h-32 w-32 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-laptop fa-3x text-white mb-2"></i>
                    <h3 className="text-xl font-bold text-white">Electronics</h3>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-gray-600 mb-4">Latest gadgets and electronics for your needs. From smartphones to laptops and accessories.</p>
                <a href="/products" className="inline-flex items-center px-4 py-2 border border-primary-600 text-sm font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transition duration-150 ease-in-out">
                  Browse Electronics
                  <svg className="ml-2 -mr-1 h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative h-40 bg-gradient-to-r from-purple-500 to-purple-600">
                <div className="absolute inset-0 flex items-center justify-center opacity-25">
                  <svg className="h-32 w-32 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H6a2 2 0 01-2-2V5z" />
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-tshirt fa-3x text-white mb-2"></i>
                    <h3 className="text-xl font-bold text-white">Clothing</h3>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-gray-600 mb-4">Trendy fashion items for all seasons. Find the perfect outfit for any occasion.</p>
                <a href="/products" className="inline-flex items-center px-4 py-2 border border-primary-600 text-sm font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transition duration-150 ease-in-out">
                  Browse Clothing
                  <svg className="ml-2 -mr-1 h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative h-40 bg-gradient-to-r from-green-500 to-green-600">
                <div className="absolute inset-0 flex items-center justify-center opacity-25">
                  <svg className="h-32 w-32 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-home fa-3x text-white mb-2"></i>
                    <h3 className="text-xl font-bold text-white">Home & Living</h3>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-gray-600 mb-4">Everything you need for your home. From furniture to decor and kitchen essentials.</p>
                <a href="/products" className="inline-flex items-center px-4 py-2 border border-primary-600 text-sm font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transition duration-150 ease-in-out">
                  Browse Home Items
                  <svg className="ml-2 -mr-1 h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gray-100 rounded-xl overflow-hidden mb-12">
          <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
            <div className="px-6 py-6 bg-primary-700 rounded-lg md:py-12 md:px-12 lg:py-16 lg:px-16 xl:flex xl:items-center">
              <div className="xl:w-0 xl:flex-1">
                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Want product news and updates?</h2>
                <p className="mt-3 max-w-3xl text-lg leading-6 text-primary-200">Sign up for our newsletter to stay up to date with new products, special offers, and more.</p>
              </div>
              <div className="mt-8 sm:w-full sm:max-w-md xl:mt-0 xl:ml-8">
                <form className="sm:flex">
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <input id="email-address" name="email" type="email" autoComplete="email" required className="w-full border-white px-5 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-700 focus:ring-white rounded-md" placeholder="Enter your email" />
                  <button type="submit" className="mt-3 w-full flex items-center justify-center px-5 py-3 border border-transparent shadow text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-700 focus:ring-white sm:mt-0 sm:ml-3 sm:w-auto sm:flex-shrink-0">
                    Subscribe
                  </button>
                </form>
                <p className="mt-3 text-sm text-primary-200">
                  We care about your data. Read our
                  <a href="#" className="text-white font-medium underline"> Privacy Policy</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
