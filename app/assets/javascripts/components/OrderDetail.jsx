// app/assets/javascripts/components/OrderDetail.jsx
var OrderDetail = createReactClass({
  getInitialState: function() {
    return {
      order: this.props.order || null,
      loading: !this.props.order,
      error: null
    };
  },
  
  componentDidMount: function() {
    if (!this.props.order && this.props.orderId) {
      this.fetchOrder(this.props.orderId);
    }
  },
  
  fetchOrder: function(orderId) {
    this.setState({ loading: true });
    
    fetch(`/api/orders/${orderId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        this.setState({
          order: data,
          loading: false,
          error: null
        });
      })
      .catch(error => {
        this.setState({
          error: 'Error fetching order: ' + error.message,
          loading: false
        });
      });
  },
  
  formatDate: function(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  },
  
  getStatusBadgeClass: function(status) {
    switch(status) {
      case 'pending':
        return 'badge-warning';
      case 'processing':
        return 'badge-info';
      case 'completed':
        return 'badge-success';
      case 'cancelled':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  },
  
  render: function() {
    const { order, loading, error } = this.state;
    
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
    
    if (!order) {
      return (
        <div className="alert alert-warning">Order not found.</div>
      );
    }
    
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Order #{order.id}</h2>
          <span className={`badge ${this.getStatusBadgeClass(order.status)} p-2`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        
        <div className="card mb-4">
          <div className="card-header bg-light">
            <div className="row">
              <div className="col-md-6">
                <strong>Order Date:</strong> {this.formatDate(order.created_at)}
              </div>
              <div className="col-md-6 text-md-right">
                <strong>Order Total:</strong> ${parseFloat(order.total).toFixed(2)}
              </div>
            </div>
          </div>
          
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="thead-light">
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.product.image_url ? (
                            <img 
                              src={item.product.image_url} 
                              alt={item.product.name} 
                              className="img-thumbnail mr-3" 
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
                            <a href={`/products/${item.product.id}`} className="text-muted small">
                              View Product
                            </a>
                          </div>
                        </div>
                      </td>
                      <td>${parseFloat(item.price).toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-right"><strong>Subtotal:</strong></td>
                    <td>${parseFloat(order.total).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-right"><strong>Shipping:</strong></td>
                    <td>Free</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-right"><strong>Tax:</strong></td>
                    <td>${(parseFloat(order.total) * 0.1).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-right"><strong>Total:</strong></td>
                    <td><strong>${(parseFloat(order.total) * 1.1).toFixed(2)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">Shipping Information</h5>
              </div>
              <div className="card-body">
                {order.shipping_address ? (
                  <address>
                    <strong>{JSON.parse(order.shipping_address).fullName}</strong><br />
                    {JSON.parse(order.shipping_address).address}<br />
                    {JSON.parse(order.shipping_address).city}, {JSON.parse(order.shipping_address).state} {JSON.parse(order.shipping_address).zipCode}<br />
                    {JSON.parse(order.shipping_address).country}
                  </address>
                ) : (
                  <p className="text-muted">No shipping address provided</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">Payment Information</h5>
              </div>
              <div className="card-body">
                {order.payment_method ? (
                  <div>
                    <p>
                      <strong>Payment Method:</strong> {order.payment_method === 'credit_card' ? 'Credit Card' : 'PayPal'}<br />
                      {order.payment_id && <span><strong>Payment ID:</strong> {order.payment_id}</span>}
                    </p>
                    
                    {order.billing_address && (
                      <div>
                        <h6>Billing Address:</h6>
                        <address>
                          <strong>{JSON.parse(order.billing_address).fullName}</strong><br />
                          {JSON.parse(order.billing_address).address}<br />
                          {JSON.parse(order.billing_address).city}, {JSON.parse(order.billing_address).state} {JSON.parse(order.billing_address).zipCode}<br />
                          {JSON.parse(order.billing_address).country}
                        </address>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted">No payment information available</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <a href="/orders" className="btn btn-outline-primary mr-3">
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Orders
          </a>
          <a href="/products" className="btn btn-primary">
            <i className="fas fa-shopping-bag mr-2"></i>
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }
});
