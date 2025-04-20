// app/assets/javascripts/components/ProductList.jsx
var ProductList = createReactClass({
  getInitialState: function() {
    return {
      products: this.props.products || [],
      categories: this.props.categories || [],
      selectedCategoryId: this.props.selectedCategoryId || null,
      minPrice: '',
      maxPrice: '',
      loading: false,
      error: null
    };
  },
  
  componentDidMount: function() {
    if (!this.props.products) {
      this.fetchProducts();
    }
    
    if (!this.props.categories) {
      this.fetchCategories();
    }
  },
  
  fetchProducts: function(categoryId, minPrice, maxPrice) {
    this.setState({ loading: true });
    
    let url = '/api/products';
    let params = [];
    
    if (categoryId) {
      params.push(`category_id=${categoryId}`);
    }
    
    if (minPrice) {
      params.push(`min_price=${minPrice}`);
    }
    
    if (maxPrice) {
      params.push(`max_price=${maxPrice}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
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
          error: null,
          selectedCategoryId: categoryId || null
        });
      })
      .catch(error => {
        this.setState({
          error: 'Error fetching products: ' + error.message,
          loading: false
        });
      });
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
          categories: data,
          error: null
        });
      })
      .catch(error => {
        this.setState({
          error: 'Error fetching categories: ' + error.message
        });
      });
  },
  
  handleCategoryClick: function(categoryId, event) {
    event.preventDefault();
    this.fetchProducts(categoryId, this.state.minPrice, this.state.maxPrice);
  },
  
  handlePriceChange: function(field, event) {
    this.setState({ [field]: event.target.value });
  },
  
  handleFilterSubmit: function(event) {
    event.preventDefault();
    this.fetchProducts(this.state.selectedCategoryId, this.state.minPrice, this.state.maxPrice);
  },
  
  addToCart: function(productId) {
    if (!this.props.currentUser) {
      window.location.href = '/login';
      return;
    }
    
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
      alert('Product added to cart!');
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error adding product to cart. Please try again.');
    });
  },
  
  render: function() {
    const { products, categories, selectedCategoryId, loading, error } = this.state;
    
    // Find the selected category object
    const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
    
    return (
      <div className="row">
        {/* Categories and Filters Sidebar */}
        <div className="col-md-3">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Categories</h5>
            </div>
            <div className="card-body">
              <div className="list-group">
                <a href="#" 
                   onClick={(e) => this.handleCategoryClick(null, e)}
                   className={`list-group-item list-group-item-action ${!selectedCategoryId ? 'active' : ''}`}>
                  All Products
                </a>
                {categories.map(category => (
                  <a key={category.id} 
                     href="#" 
                     onClick={(e) => this.handleCategoryClick(category.id, e)}
                     className={`list-group-item list-group-item-action ${selectedCategoryId === category.id ? 'active' : ''}`}>
                    {category.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Filter</h5>
            </div>
            <div className="card-body">
              <form onSubmit={this.handleFilterSubmit}>
                <div className="form-group">
                  <label htmlFor="priceRange">Price Range</label>
                  <div className="d-flex">
                    <input 
                      type="number" 
                      className="form-control mr-2" 
                      placeholder="Min" 
                      min="0" 
                      step="0.01"
                      value={this.state.minPrice}
                      onChange={(e) => this.handlePriceChange('minPrice', e)}
                    />
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="Max" 
                      min="0" 
                      step="0.01"
                      value={this.state.maxPrice}
                      onChange={(e) => this.handlePriceChange('maxPrice', e)}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <button type="submit" className="btn btn-primary btn-block">Apply Filters</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Products Display */}
        <div className="col-md-9">
          {error && (
            <div className="alert alert-danger">{error}</div>
          )}
          
          {selectedCategory ? (
            <div>
              <h2>{selectedCategory.name}</h2>
              <p className="text-muted">{selectedCategory.description}</p>
            </div>
          ) : (
            <h2>All Products</h2>
          )}
          
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row">
              {products.length > 0 ? (
                products.map(product => (
                  <div key={product.id} className="col-md-4 mb-4">
                    <div className="card h-100">
                      {product.image_url ? (
                        <img src={product.image_url} className="card-img-top" alt={product.name} />
                      ) : (
                        <div className="card-img-top bg-light text-center py-4">
                          <i className="fas fa-image fa-4x text-muted"></i>
                        </div>
                      )}
                      <div className="card-body">
                        <h5 className="card-title">{product.name}</h5>
                        <p className="card-text text-muted">
                          {product.description && product.description.length > 80 
                            ? product.description.substring(0, 80) + '...' 
                            : product.description}
                        </p>
                        <p className="card-text font-weight-bold">${parseFloat(product.price).toFixed(2)}</p>
                        <div className="d-flex justify-content-between">
                          <a href={`/products/${product.id}`} className="btn btn-primary">View Details</a>
                          {product.stock > 0 ? (
                            <button 
                              onClick={() => this.addToCart(product.id)} 
                              className="btn btn-outline-primary">
                              Add to Cart
                            </button>
                          ) : (
                            <button className="btn btn-outline-secondary" disabled>Out of Stock</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="alert alert-info">
                    No products found. Please try a different category or filter.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
});
