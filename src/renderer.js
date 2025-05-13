import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return React.createElement('h1', null, 'hello world');
}

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(React.createElement(App));
