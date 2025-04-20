// app/assets/javascripts/components/Auth/Signup.jsx
var Signup = createReactClass({
  getInitialState: function() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      errors: {},
      serverErrors: [],
      loading: false
    };
  },
  
  handleChange: function(field, event) {
    this.setState({ [field]: event.target.value });
  },
  
  validateForm: function() {
    const errors = {};
    
    if (!this.state.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!this.state.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!this.state.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(this.state.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!this.state.password) {
      errors.password = 'Password is required';
    } else if (this.state.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (this.state.password !== this.state.passwordConfirmation) {
      errors.passwordConfirmation = 'Passwords do not match';
    }
    
    this.setState({ errors });
    return Object.keys(errors).length === 0;
  },
  
  handleSubmit: function(event) {
    event.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }
    
    this.setState({ loading: true, serverErrors: [] });
    
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    
    fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        user: {
          first_name: this.state.firstName,
          last_name: this.state.lastName,
          email: this.state.email,
          password: this.state.password,
          password_confirmation: this.state.passwordConfirmation
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
          throw new Error(JSON.stringify(data.errors || { base: ['An error occurred during signup'] }));
        });
      }
      
      return response.json();
    })
    .then(data => {
      // If we get here, signup was successful but no redirect happened
      window.location.href = '/';
    })
    .catch(error => {
      try {
        const errorData = JSON.parse(error.message);
        const serverErrors = [];
        
        Object.keys(errorData).forEach(key => {
          errorData[key].forEach(message => {
            serverErrors.push(`${key.charAt(0).toUpperCase() + key.slice(1)} ${message}`);
          });
        });
        
        this.setState({
          serverErrors,
          loading: false
        });
      } catch (e) {
        this.setState({
          serverErrors: [error.message],
          loading: false
        });
      }
    });
  },
  
  render: function() {
    const { firstName, lastName, email, password, passwordConfirmation, errors, serverErrors, loading } = this.state;
    
    return (
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">Sign Up</h2>
        </div>
        <div className="card-body">
          {serverErrors.length > 0 && (
            <div className="alert alert-danger">
              <ul className="mb-0">
                {serverErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <form onSubmit={this.handleSubmit}>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                value={firstName}
                onChange={(e) => this.handleChange('firstName', e)}
                disabled={loading}
              />
              {errors.firstName && (
                <div className="invalid-feedback">{errors.firstName}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                value={lastName}
                onChange={(e) => this.handleChange('lastName', e)}
                disabled={loading}
              />
              {errors.lastName && (
                <div className="invalid-feedback">{errors.lastName}</div>
              )}
            </div>
            
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
              {errors.password ? (
                <div className="invalid-feedback">{errors.password}</div>
              ) : (
                <small className="form-text text-muted">Minimum 6 characters</small>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="passwordConfirmation">Confirm Password</label>
              <input
                type="password"
                id="passwordConfirmation"
                className={`form-control ${errors.passwordConfirmation ? 'is-invalid' : ''}`}
                value={passwordConfirmation}
                onChange={(e) => this.handleChange('passwordConfirmation', e)}
                disabled={loading}
              />
              {errors.passwordConfirmation && (
                <div className="invalid-feedback">{errors.passwordConfirmation}</div>
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
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="card-footer text-center">
          <p className="mb-0">Already have an account? <a href="/login">Log in</a></p>
        </div>
      </div>
    );
  }
});
