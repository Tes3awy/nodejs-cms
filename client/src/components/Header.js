import React from 'react';
import Button from '@material-ui/core/Button';
import { NavLink } from 'react-router-dom';

const Header = () => (
  <header>
    <h1>Tes Official Website</h1>
    <NavLink to="/" className="nav-link" exact={true} activeClassName="is-active">
      <Button variant="contained" color="secondary">
        Home
      </Button>
    </NavLink>
    <NavLink to="/posts" className="nav-link" activeClassName="is-active">
      <Button variant="contained" color="secondary">
        Posts
      </Button>
    </NavLink>
    <NavLink to="/about" className="nav-link" activeClassName="is-active">
      <Button variant="contained" color="secondary">
        About
      </Button>
    </NavLink>
    <NavLink to="/contact" className="nav-link" activeClassName="is-active">
      <Button variant="contained" color="secondary">
        Contact us
      </Button>
    </NavLink>
  </header>
);

export default Header;
