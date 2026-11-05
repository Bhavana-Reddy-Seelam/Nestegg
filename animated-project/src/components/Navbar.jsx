function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">Yolk & Co.</h2>

      <div className="nav-links">
        <a href="#eggs">Our Eggs</a>
        <a href="#shop">Shop</a>
      </div>

      <a href="#shop" className="order-btn">
        Order eggs
      </a>
    </nav>
  );
}

export default Navbar;