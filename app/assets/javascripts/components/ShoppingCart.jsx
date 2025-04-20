// app/assets/javascripts/components/ShoppingCart.jsx
var ShoppingCart = createReactClass({
  getInitialState: function() {
    return {
      cart: null,
      loading: true,
      error: null
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
  
  updateQuantity: function(itemId, newQuantity) {
    if (newQuantity < 1) {
      return;
    }
    
    const item = this.state.cart.order_items.find(item => item.id === itemId);
    if (!item || newQuantity > item.product.stock) {
      return;
    }
    
    // Optimistically update the UI
    const updatedItems = this.state.cart.order_items.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    const updatedCart = {
      ...this.state.cart,
      order_items: updatedItems,
      total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    this.setState({ cart: updatedCart });
    
    // Send update to server
    fetch(`/api/orders/update_item/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({
        quantity: newQuantity
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
        // Revert the optimistic update if there's an error
        this.fetchCart();
      }
      return response.json();
    })
    .then(data => {
      // Update with the server response
      this.setState({ cart: data });
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error updating item. Please try again.');
      // Revert the optimistic update
      this.fetchCart();
    });
  },
  
  removeItem: function(itemId) {
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }
    
    // Optimistically update the UI
    const updatedItems = this.state.cart.order_items.filter(item => item.id !== itemId);
    
    const updatedCart = {
      ...this.state.cart,
      order_items: updatedItems,
      total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    this.setState({ cart: updatedCart });
    
    // Send delete request to server
    fetch(`/api/orders/remove_item/${itemId}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
        // Revert the optimistic update if there's an error
        this.fetchCart();
      }
      return response.json();
    })
    .then(data => {
      // Update with the server response
      this.setState({ cart: data });
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error removing item. Please try again.');
      // Revert the optimistic update
      this.fetchCart();
    });
  },
  
  checkout: function() {
    if (this.state.cart.order_items.length === 0) {
      alert('Your cart is empty. Add some products before checking out.');
      return;
    }
    
    window.location.href = '/checkout';
  },
  
  render: function() {
    const { cart, loading, error } = this.state;
    
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="alert alert-danger">{error}</div>
      );
    }
    
    if (!cart || cart.order_items.length === 0) {
      return (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-shopping-cart fa-5x text-muted"></i>
          </div>
          <h3>Your cart is empty</h3>
          <p className="text-muted">Add some products to your cart and they will appear here.</p>
          <a href="/products" className="btn btn-primary mt-3">
            <i className="fas fa-shopping-bag mr-2"></i>
            Continue Shopping
          </a>
        </div>
      );
    }
    
    return (
      <div>
        <h2 className="mb-4">Your Shopping Cart</h2>
        
        <div className="card mb-4">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th scope="col" className="border-0">Product</th>
                    <th scope="col" className="border-0">Price</th>
                    <th scope="col" className="border-0">Quantity</th>
                    <th scope="col" className="border-0">Subtotal</th>
                    <th scope="col" className="border-0"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.order_items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.product.image_url ? (
                            <img 
                              src={item.product.image_url} 
                              alt={item.product.name} 
                              className="img-fluid rounded mr-3" 
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div 
                              className="bg-light text-center rounded mr-3" 
                              style={{ width: '50px', height: '50px' }}
                            >
                              <i className="fas fa-image text-muted" style={{ lineHeight: '50px' }}></i>
                            </div>
                          )}
                          <div>
                            <h6 className="mb-0">{item.product.name}</h6>
                            {item.product.category && (
                              <small className="text-muted">{item.product.category.name}</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>${parseFloat(item.price).toFixed(2)}</td>
                      <td>
                        <div className="input-group input-group-sm" style={{ width: '120px' }}>
                          <div className="input-group-prepend">
                            <button 
                              className="btn btn-outline-secondary" 
                              type="button"
                              onClick={() => this.updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}>
                              <i className="fas fa-minus"></i>
                            </button>
                          </div>
                          <input 
                            type="text" 
                            className="form-control text-center" 
                            value={item.quantity}
                            readOnly
                          />
                          <div className="input-group-append">
                            <button 
                              className="btn btn-outline-secondary" 
                              type="button"
                              onClick={() => this.updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}>
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => this.removeItem(item.id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6">
            <a href="/products" className="btn btn-outline-primary">
              <i className="fas fa-arrow-left mr-2"></i>
              Continue Shopping
            </a>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Order Summary</h5>
                <div className="d-flex justify-content-between mb-3">
                  <span>Subtotal:</span>
                  <span>${parseFloat(cart.total).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total:</strong>
                  <strong className="text-primary">${parseFloat(cart.total).toFixed(2)}</strong>
                </div>
                <button 
                  className="btn btn-primary btn-block"
                  onClick={this.checkout}>
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
