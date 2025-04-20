// app/assets/javascripts/components/Counter.jsx
var Counter = createReactClass({
  getInitialState: function() {
    return { count: 0 };
  },
  
  incrementCount: function() {
    this.setState({ count: this.state.count + 1 });
  },
  
  decrementCount: function() {
    this.setState({ count: this.state.count - 1 });
  },
  
  render: function() {
    return (
      <div className="counter-container">
        <h2>React Counter Example</h2>
        <p>Current Count: <strong>{this.state.count}</strong></p>
        <button onClick={this.decrementCount} className="btn btn-danger">-</button>
        <button onClick={this.incrementCount} className="btn btn-success">+</button>
      </div>
    );
  }
});
