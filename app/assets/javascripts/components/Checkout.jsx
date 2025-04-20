// app/assets/javascripts/components/Checkout.jsx
var Checkout = createReactClass({
  getInitialState: function() {
    return {
      cart: null,
      loading: true,
      error: null,
      shippingAddress: {
        fullName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States'
      },
      billingAddress: {
        fullName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States'
      },
      sameAsBilling: true,
      paymentMethod: 'credit_card',
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
      processingOrder: false,
      orderComplete: false,
      orderId: null
    };
  },
  
  componentDidMount: function() {
    this.fetchCart();
    
    // If user is logged in, pre-fill name
    if (this.props.currentUser) {
      const fullName = this.props.currentUser.first_name + ' ' + this.props.currentUser.last_name;
      this.setState({
        shippingAddress: {
          ...this.state.shippingAddress,
          fullName: fullName
        },
        billingAddress: {
          ...this.state.billingAddress,
          fullName: fullName
        }
      });
    }
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
        // Redirect to cart page if cart is empty
        if (!data.order_items || data.order_items.length === 0) {
          window.location.href = '/cart';
          return;
        }
        
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
  
  handleInputChange: function(addressType, field, event) {
    const value = event.target.value;
    
    this.setState(prevState => ({
      [addressType]: {
        ...prevState[addressType],
        [field]: value
      }
    }));
    
    // If shipping and billing are the same, update billing too
    if (addressType === 'shippingAddress' && this.state.sameAsBilling) {
      this.setState(prevState => ({
        billingAddress: {
          ...prevState.billingAddress,
          [field]: value
        }
      }));
    }
  },
  
  handleSameAsBillingChange: function(event) {
    const checked = event.target.checked;
    
    this.setState({
      sameAsBilling: checked
    });
    
    if (checked) {
      this.setState(prevState => ({
        billingAddress: {
          ...prevState.shippingAddress
        }
      }));
    }
  },
  
  handlePaymentMethodChange: function(event) {
    this.setState({
      paymentMethod: event.target.value
    });
  },
  
  handleCardNumberChange: function(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    // Format with spaces every 4 digits
    if (value.length > 0) {
      value = value.match(/.{1,4}/g).join(' ');
    }
    
    this.setState({
      cardNumber: value
    });
  },
  
  handleCardExpiryChange: function(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    // Format as MM/YY
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    this.setState({
      cardExpiry: value
    });
  },
  
  handleCardCvcChange: function(event) {
    const value = event.target.value.replace(/\D/g, '').substring(0, 3);
    
    this.setState({
      cardCvc: value
    });
  },
  
  validateForm: function() {
    // Basic validation - in a real app, you'd want more robust validation
    const { shippingAddress, billingAddress, paymentMethod, cardNumber, cardExpiry, cardCvc } = this.state;
    
    if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.zipCode) {
      alert('Please fill in all shipping address fields');
      return false;
    }
    
    if (!this.state.sameAsBilling) {
      if (!billingAddress.fullName || !billingAddress.address || !billingAddress.city || 
          !billingAddress.state || !billingAddress.zipCode) {
        alert('Please fill in all billing address fields');
        return false;
      }
    }
    
    if (paymentMethod === 'credit_card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        alert('Please enter a valid card number');
        return false;
      }
      
      if (!cardExpiry || cardExpiry.length < 5) {
        alert('Please enter a valid expiration date (MM/YY)');
        return false;
      }
      
      if (!cardCvc || cardCvc.length < 3) {
        alert('Please enter a valid CVC code');
        return false;
      }
    }
    
    return true;
  },
  
  handleSubmit: function(event) {
    event.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }
    
    this.setState({ processingOrder: true });
    
    // In a real application, you would process the payment with Stripe or another payment processor here
    
    // For now, we'll just submit the order to our backend
    fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({
        shipping_address: this.state.shippingAddress,
        billing_address: this.state.sameAsBilling ? this.state.shippingAddress : this.state.billingAddress,
        payment_method: this.state.paymentMethod
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      this.setState({
        orderComplete: true,
        processingOrder: false,
        orderId: data.id
      });
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error processing your order. Please try again.');
      this.setState({ processingOrder: false });
    });
  },
  
  render: function() {
    const { cart, loading, error, shippingAddress, billingAddress, sameAsBilling, 
            paymentMethod, cardNumber, cardExpiry, cardCvc, processingOrder, orderComplete, orderId } = this.state;
    
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
    
    if (orderComplete) {
      return (
        <div className="card">
          <div className="card-body text-center">
            <div className="mb-4">
              <i className="fas fa-check-circle text-success fa-5x"></i>
            </div>
            <h2 className="mb-4">Thank You for Your Order!</h2>
            <p className="lead">Your order has been successfully placed.</p>
            <p>Order ID: <strong>{orderId}</strong></p>
            <p>We've sent a confirmation email with details of your order.</p>
            <div className="mt-4">
              <a href="/" className="btn btn-primary mr-3">Continue Shopping</a>
              <a href={`/orders/${orderId}`} className="btn btn-outline-primary">View Order</a>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Shipping Information</h5>
            </div>
            <div className="card-body">
              <form>
                <div className="form-group">
                  <label htmlFor="shippingFullName">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="shippingFullName" 
                    value={shippingAddress.fullName}
                    onChange={(e) => this.handleInputChange('shippingAddress', 'fullName', e)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="shippingAddress">Address</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="shippingAddress" 
                    value={shippingAddress.address}
                    onChange={(e) => this.handleInputChange('shippingAddress', 'address', e)}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="shippingCity">City</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="shippingCity" 
                      value={shippingAddress.city}
                      onChange={(e) => this.handleInputChange('shippingAddress', 'city', e)}
                      required
                    />
                  </div>
                  <div className="form-group col-md-4">
                    <label htmlFor="shippingState">State</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="shippingState" 
                      value={shippingAddress.state}
                      onChange={(e) => this.handleInputChange('shippingAddress', 'state', e)}
                      required
                    />
                  </div>
                  <div className="form-group col-md-2">
                    <label htmlFor="shippingZipCode">Zip Code</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="shippingZipCode" 
                      value={shippingAddress.zipCode}
                      onChange={(e) => this.handleInputChange('shippingAddress', 'zipCode', e)}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="shippingCountry">Country</label>
                  <select 
                    className="form-control" 
                    id="shippingCountry"
                    value={shippingAddress.country}
                    onChange={(e) => this.handleInputChange('shippingAddress', 'country', e)}
                    required
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                    <option value="China">China</option>
                    <option value="India">India</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <div className="custom-control custom-checkbox">
                    <input 
                      type="checkbox" 
                      className="custom-control-input" 
                      id="sameAsBilling"
                      checked={sameAsBilling}
                      onChange={this.handleSameAsBillingChange}
                    />
                    <label className="custom-control-label" htmlFor="sameAsBilling">
                      Billing address same as shipping
                    </label>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          {!sameAsBilling && (
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Billing Information</h5>
              </div>
              <div className="card-body">
                <form>
                  <div className="form-group">
                    <label htmlFor="billingFullName">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="billingFullName" 
                      value={billingAddress.fullName}
                      onChange={(e) => this.handleInputChange('billingAddress', 'fullName', e)}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="billingAddress">Address</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="billingAddress" 
                      value={billingAddress.address}
                      onChange={(e) => this.handleInputChange('billingAddress', 'address', e)}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label htmlFor="billingCity">City</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="billingCity" 
                        value={billingAddress.city}
                        onChange={(e) => this.handleInputChange('billingAddress', 'city', e)}
                        required
                      />
                    </div>
                    <div className="form-group col-md-4">
                      <label htmlFor="billingState">State</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="billingState" 
                        value={billingAddress.state}
                        onChange={(e) => this.handleInputChange('billingAddress', 'state', e)}
                        required
                      />
                    </div>
                    <div className="form-group col-md-2">
                      <label htmlFor="billingZipCode">Zip Code</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="billingZipCode" 
                        value={billingAddress.zipCode}
                        onChange={(e) => this.handleInputChange('billingAddress', 'zipCode', e)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="billingCountry">Country</label>
                    <select 
                      className="form-control" 
                      id="billingCountry"
                      value={billingAddress.country}
                      onChange={(e) => this.handleInputChange('billingAddress', 'country', e)}
                      required
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Japan">Japan</option>
                      <option value="China">China</option>
                      <option value="India">India</option>
                    </select>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Payment Information</h5>
            </div>
            <div className="card-body">
              <form>
                <div className="form-group">
                  <label>Payment Method</label>
                  <div className="custom-control custom-radio">
                    <input 
                      type="radio" 
                      id="creditCard" 
                      name="paymentMethod" 
                      className="custom-control-input"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={this.handlePaymentMethodChange}
                    />
                    <label className="custom-control-label" htmlFor="creditCard">
                      <i className="fab fa-cc-visa mr-2"></i>
                      <i className="fab fa-cc-mastercard mr-2"></i>
                      <i className="fab fa-cc-amex mr-2"></i>
                      Credit Card
                    </label>
                  </div>
                  <div className="custom-control custom-radio">
                    <input 
                      type="radio" 
                      id="paypal" 
                      name="paymentMethod" 
                      className="custom-control-input"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={this.handlePaymentMethodChange}
                    />
                    <label className="custom-control-label" htmlFor="paypal">
                      <i className="fab fa-paypal mr-2"></i>
                      PayPal
                    </label>
                  </div>
                </div>
                
                {paymentMethod === 'credit_card' && (
                  <div>
                    <div className="form-group">
                      <label htmlFor="cardNumber">Card Number</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="cardNumber" 
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={this.handleCardNumberChange}
                        maxLength="19"
                        required
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label htmlFor="cardExpiry">Expiration Date</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="cardExpiry" 
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={this.handleCardExpiryChange}
                          maxLength="5"
                          required
                        />
                      </div>
                      <div className="form-group col-md-6">
                        <label htmlFor="cardCvc">CVC</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="cardCvc" 
                          placeholder="123"
                          value={cardCvc}
                          onChange={this.handleCardCvcChange}
                          maxLength="3"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {paymentMethod === 'paypal' && (
                  <div className="alert alert-info">
                    <p className="mb-0">You will be redirected to PayPal to complete your payment after reviewing your order.</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              {cart && cart.order_items && cart.order_items.map(item => (
                <div key={item.id} className="d-flex justify-content-between mb-3">
                  <div>
                    <h6 className="mb-0">{item.product.name}</h6>
                    <small className="text-muted">Qty: {item.quantity}</small>
                  </div>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <hr />
              
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${cart && parseFloat(cart.total).toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>${cart && (parseFloat(cart.total) * 0.1).toFixed(2)}</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong className="text-primary">
                  ${cart && (parseFloat(cart.total) * 1.1).toFixed(2)}
                </strong>
              </div>
              
              <button 
                className="btn btn-primary btn-block"
                onClick={this.handleSubmit}
                disabled={processingOrder}
              >
                {processingOrder ? (
                  <span>
                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </span>
                ) : (
                  'Place Order'
                )}
              </button>
              
              <div className="text-center mt-3">
                <small className="text-muted">
                  By placing your order, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
