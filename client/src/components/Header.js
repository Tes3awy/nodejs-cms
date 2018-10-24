import React from 'react';
import { NavLink } from 'react-router-dom';

const Header = () => (
  <header>
    <h1>Tes Official Website</h1>
    <NavLink to="/" exact={true}>
      Home
    </NavLink>
    <NavLink to="/posts">
      Posts
    </NavLink>
  </header>
);

export default Header;
