import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
// import the application
import App from './App';
import {SocketProvider} from "./context/SocketProvider";

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render (
  <React.StrictMode>
    <BrowserRouter>
      {/* <SocketProvider>   */}
        <App/>
      {/* </SocketProvider>  */}
    </BrowserRouter>
  </React.StrictMode>
)
