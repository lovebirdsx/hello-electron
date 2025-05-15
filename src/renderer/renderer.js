import React from 'react';
import ReactDOM from 'react-dom/client';

function reload() {
  const { electronAPI } = globalThis;
  electronAPI.requestReload();
}

function toggleDevTools() {
  const { electronAPI } = globalThis;
  electronAPI.toggleDevTools();
}

function App() {
  return (
    <div>
      <h1>hello world</h1>
      <section>
        <h2>Test</h2>
        <button onClick={reload}>reload</button>
        <button onClick={toggleDevTools}>toggle dev tools</button>
      </section>
    </div>
  );
}

console.log('Renderer script loaded');
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
