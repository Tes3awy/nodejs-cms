import React from 'react';
import ReactDOM from 'react-dom';
import AppRouter from './routers/AppRouter';

const jsx = (
  <div>
    <AppRouter />
  </div>
);

ReactDOM.render(jsx, document.getElementById('root'));
