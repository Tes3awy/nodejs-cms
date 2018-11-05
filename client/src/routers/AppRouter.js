import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Header from '../components/Header';

const AppRouter = () => (
  <BrowserRouter>
    <div>
      <Header />
      <Switch>
        <Route path="/" exact={true} />
        <Route path="/about" />
      </Switch>
    </div>
  </BrowserRouter>
);

export default AppRouter;
