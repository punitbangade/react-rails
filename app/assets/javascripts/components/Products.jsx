// app/assets/javascripts/components/Products.jsx
var Products = createReactClass({
  getInitialState: function() {
    return {
      products: [],
      categories: [],
      loading: true,
      error: null,
      selectedCategory: this.props.selectedCategoryId || '',
      searchQuery: '',
      sortBy: 'newest',
      priceRange: [0, 1000],
      filtersOpen: false,
      addingToCart: null
    };
  },

  componentDidMount: function() {
    this.fetchCategories();
    this.fetchProducts();
  },

  fetchCategories: function() {
    fetch('/api/categories')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        this.setState({
          categories: data
        });
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  },

  fetchProducts: function() {
    this.setState({ loading: true });

    const { selectedCategory, searchQuery, sortBy, priceRange } = this.state;

    let url = '/api/products?';

    if (selectedCategory) {
      url += `category_id=${selectedCategory}&`;
    }

    if (searchQuery) {
      url += `search=${encodeURIComponent(searchQuery)}&`;
    }

    if (priceRange && priceRange.length === 2) {
      url += `min_price=${priceRange[0]}&max_price=${priceRange[1]}&`;
    }

    // Add sorting parameter
    switch (sortBy) {
      case 'price_low':
        url += 'sort=price&order=asc&';
        break;
      case 'price_high':
        url += 'sort=price&order=desc&';
        break;
      case 'newest':
        url += 'sort=created_at&order=desc&';
        break;
      case 'name_asc':
        url += 'sort=name&order=asc&';
        break;
      default:
        break;
    }

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        this.setState({
          products: data,
          loading: false,
          error: null
        });
      })
      .catch(error => {
        this.setState({
          error: 'Error fetching products: ' + error.message,
          loading: false
        });
      });
  },

  handleCategoryChange: function(e) {
    const categoryId = e.target.value;
    this.setState({ selectedCategory: categoryId }, this.fetchProducts);
  },

  handleSearchChange: function(e) {
    this.setState({ searchQuery: e.target.value });
  },

  handleSearchSubmit: function(e) {
    e.preventDefault();
    this.fetchProducts();
  },

  handleSortChange: function(e) {
    this.setState({ sortBy: e.target.value }, this.fetchProducts);
  },

  handlePriceRangeChange: function(values) {
    this.setState({ priceRange: values });
  },

  handlePriceRangeApply: function() {
    this.fetchProducts();
  },

  toggleFilters: function() {
    this.setState(prevState => ({
      filtersOpen: !prevState.filtersOpen
    }));
  },

  addToCart: function(productId) {
    if (!this.props.currentUser) {
      window.location.href = '/login';
      return;
    }

    this.setState({ addingToCart: productId });

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
    .then(data => {
      this.setState({ addingToCart: null });

      // Update the cart count in the header
      if (window.CartUpdater && typeof window.CartUpdater.updateCount === 'function') {
        // If we have the cart data with count, use it directly
        if (data && data.total_items) {
          window.CartUpdater.updateCount(data.total_items);
        } else {
          // Otherwise fetch the latest count
          window.CartUpdater.fetchCount();
        }
      }

      // Show success notification
      const productElement = document.getElementById(`product-${productId}`);
      if (productElement) {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 animate-fade-in-up';
        notification.innerHTML = `
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm">Product added to cart!</p>
            </div>
          </div>
        `;
        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
          notification.classList.add('animate-fade-out-down');
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 500);
        }, 3000);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      this.setState({ addingToCart: null });
      alert('Error adding product to cart. Please try again.');
    });
  },

  render: function() {
    const { products, categories, loading, error, selectedCategory, searchQuery, sortBy, filtersOpen, addingToCart } = this.state;

    return (
      <div className="flex flex-col lg:flex-row">
        {/* Mobile filter dialog */}
        <div className={`fixed inset-0 flex z-40 lg:hidden ${filtersOpen ? '' : 'hidden'}`} role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black bg-opacity-25" aria-hidden="true" onClick={this.toggleFilters}></div>

          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
              <button
                type="button"
                className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                onClick={this.toggleFilters}
              >
                <span className="sr-only">Close menu</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile filters */}
            <div className="mt-4 border-t border-gray-200">
              <div className="px-4 py-6">
                <h3 className="text-sm font-medium text-gray-900">Categories</h3>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <input
                      id="category-all-mobile"
                      name="category-mobile"
                      type="radio"
                      value=""
                      checked={selectedCategory === ''}
                      onChange={this.handleCategoryChange}
                      className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="category-all-mobile" className="ml-3 text-sm text-gray-600">All Categories</label>
                  </div>

                  {categories.map(category => (
                    <div key={category.id} className="flex items-center">
                      <input
                        id={`category-${category.id}-mobile`}
                        name="category-mobile"
                        type="radio"
                        value={category.id}
                        checked={selectedCategory === category.id.toString()}
                        onChange={this.handleCategoryChange}
                        className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor={`category-${category.id}-mobile`} className="ml-3 text-sm text-gray-600">{category.name}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-64 mr-8">
          <div className="sticky top-6">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="category-all"
                    name="category"
                    type="radio"
                    value=""
                    checked={selectedCategory === ''}
                    onChange={this.handleCategoryChange}
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="category-all" className="ml-3 text-sm text-gray-600">All Categories</label>
                </div>

                {categories.map(category => (
                  <div key={category.id} className="flex items-center">
                    <input
                      id={`category-${category.id}`}
                      name="category"
                      type="radio"
                      value={category.id}
                      checked={selectedCategory === category.id.toString()}
                      onChange={this.handleCategoryChange}
                      className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor={`category-${category.id}`} className="ml-3 text-sm text-gray-600">{category.name}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Mobile filter button */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={this.toggleFilters}
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Filters
            </button>
          </div>

          {/* Search and sort */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <form onSubmit={this.handleSearchSubmit} className="flex-grow max-w-xl">
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  className="block w-full pr-10 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={this.handleSearchChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button type="submit" className="text-gray-400 hover:text-gray-500 focus:outline-none">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>

            <div className="flex items-center bg-white px-3 py-2 rounded-md shadow-sm border border-gray-300 whitespace-nowrap self-stretch md:self-auto">
              <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
              <select
                id="sort-by"
                name="sort-by"
                className="flex-grow min-w-[140px] md:min-w-[180px] border-0 p-0 text-sm text-gray-700 focus:outline-none focus:ring-0 bg-transparent"
                value={sortBy}
                onChange={this.handleSortChange}
              >
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Products grid */}
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
            <div>
              {products.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map(product => (
                    <div key={product.id} id={`product-${product.id}`} className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                      <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-center object-cover transform transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <i className="fas fa-image fa-4x text-gray-400"></i>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-grow flex flex-col">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          <a href={`/products/${product.id}`} className="hover:text-primary-600 transition-colors duration-200">
                            {product.name}
                          </a>
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">
                          {product.description}
                        </p>
                        <div className="mt-auto space-y-3">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-lg font-bold text-gray-900">
                              ${parseFloat(product.price).toFixed(2)}
                            </p>
                            {product.stock > 0 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                In Stock
                              </span>
                            )}
                          </div>
                          {product.stock > 0 ? (
                            <button
                              onClick={() => this.addToCart(product.id)}
                              disabled={addingToCart === product.id}
                              className={`inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                                addingToCart === product.id
                                  ? 'text-primary-700 bg-primary-100 cursor-wait'
                                  : 'text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                              } transition-all duration-200 ease-in-out transform hover:scale-105`}
                            >
                              {addingToCart === product.id ? (
                                <div className="flex items-center justify-center">
                                  <svg className="animate-spin mr-2 h-4 w-4 text-primary-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Adding...</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center">
                                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                  </svg>
                                  <span>Add to Cart</span>
                                </div>
                              )}
                            </button>
                          ) : (
                            <span className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-100">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
});
