import React from 'react';
import { NavLink } from 'react-router-dom';

const Footer = () => (
  <footer>
    <NavLink to="/" exact={true}>
      Home
    </NavLink>
    <NavLink to="/posts">
      Posts
    </NavLink>
    <NavLink to="/about">
      About
    </NavLink>
    <NavLink to="/contact">
      Contact us
    </NavLink>
  </footer>
);

export default Footer;
