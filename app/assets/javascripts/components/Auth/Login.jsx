// app/assets/javascripts/components/Auth/Login.jsx
var Login = createReactClass({
  getInitialState: function() {
    return {
      email: '',
      password: '',
      errors: {},
      loading: false
    };
  },
  
  handleChange: function(field, event) {
    this.setState({ [field]: event.target.value });
  },
  
  validateForm: function() {
    const errors = {};
    
    if (!this.state.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(this.state.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!this.state.password) {
      errors.password = 'Password is required';
    }
    
    this.setState({ errors });
    return Object.keys(errors).length === 0;
  },
  
  handleSubmit: function(event) {
    event.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }
    
    this.setState({ loading: true });
    
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        session: {
          email: this.state.email,
          password: this.state.password
        }
      })
    })
    .then(response => {
      if (response.redirected) {
        window.location.href = response.url;
        return;
      }
      
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || 'Invalid email/password combination');
        });
      }
      
      return response.json();
    })
    .then(data => {
      // If we get here, login was successful but no redirect happened
      window.location.href = '/';
    })
    .catch(error => {
      this.setState({
        errors: { auth: error.message },
        loading: false
      });
    });
  },
  
  render: function() {
    const { email, password, errors, loading } = this.state;
    
    return (
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">Login</h2>
        </div>
        <div className="card-body">
          {errors.auth && (
            <div className="alert alert-danger">{errors.auth}</div>
          )}
          
          <form onSubmit={this.handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                value={email}
                onChange={(e) => this.handleChange('email', e)}
                disabled={loading}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                value={password}
                onChange={(e) => this.handleChange('password', e)}
                disabled={loading}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>
            
            <div className="form-group">
              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}>
                {loading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                    Logging in...
                  </span>
                ) : (
                  'Log in'
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="card-footer text-center">
          <p className="mb-0">Don't have an account? <a href="/signup">Sign up now!</a></p>
        </div>
      </div>
    );
  }
});
