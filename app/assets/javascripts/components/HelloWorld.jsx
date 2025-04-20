// app/assets/javascripts/components/HelloWorld.jsx
var HelloWorld = createReactClass({
  render: function() {
    return (
      <div>
        <h1>Hello, {this.props.name}!</h1>
        <p>Welcome to your first React component in Rails!</p>
      </div>
    );
  }
});
