// app/assets/javascripts/components/OrderHistory.jsx
var OrderHistory = createReactClass({
  getInitialState: function() {
    return {
      orders: [],
      loading: true,
      error: null
    };
  },
  
  componentDidMount: function() {
    this.fetchOrders();
  },
  
  fetchOrders: function() {
    this.setState({ loading: true });
    
    fetch('/api/orders')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        this.setState({
          orders: data,
          loading: false,
          error: null
        });
      })
      .catch(error => {
        this.setState({
          error: 'Error fetching orders: ' + error.message,
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
    const { orders, loading, error } = this.state;
    
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
    
    if (orders.length === 0) {
      return (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="mb-4">
              <i className="fas fa-shopping-bag fa-4x text-muted"></i>
            </div>
            <h3>No Orders Yet</h3>
            <p className="text-muted">You haven't placed any orders yet.</p>
            <a href="/products" className="btn btn-primary mt-3">Start Shopping</a>
          </div>
        </div>
      );
    }
    
    return (
      <div>
        <h2 className="mb-4">Your Orders</h2>
        
        {orders.map(order => (
          <div key={order.id} className="card mb-4">
            <div className="card-header bg-light">
              <div className="row align-items-center">
                <div className="col-md-4">
                  <strong>Order #{order.id}</strong>
                </div>
                <div className="col-md-4 text-md-center">
                  <span className="text-muted">
                    Placed on {this.formatDate(order.created_at)}
                  </span>
                </div>
                <div className="col-md-4 text-md-right">
                  <span className={`badge ${this.getStatusBadgeClass(order.status)} p-2`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
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
                      <td colSpan="3" className="text-right"><strong>Total:</strong></td>
                      <td><strong>${parseFloat(order.total).toFixed(2)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="row mt-4">
                <div className="col-md-6">
                  <h5>Shipping Address</h5>
                  {order.shipping_address ? (
                    <address>
                      {JSON.parse(order.shipping_address).fullName}<br />
                      {JSON.parse(order.shipping_address).address}<br />
                      {JSON.parse(order.shipping_address).city}, {JSON.parse(order.shipping_address).state} {JSON.parse(order.shipping_address).zipCode}<br />
                      {JSON.parse(order.shipping_address).country}
                    </address>
                  ) : (
                    <p className="text-muted">No shipping address provided</p>
                  )}
                </div>
                
                <div className="col-md-6">
                  <h5>Payment Information</h5>
                  {order.payment_method ? (
                    <p>
                      <strong>Payment Method:</strong> {order.payment_method === 'credit_card' ? 'Credit Card' : 'PayPal'}<br />
                      {order.payment_id && <span><strong>Payment ID:</strong> {order.payment_id}</span>}
                    </p>
                  ) : (
                    <p className="text-muted">No payment information available</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="card-footer bg-white">
              <a href={`/orders/${order.id}`} className="btn btn-outline-primary">
                View Order Details
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  }
});
