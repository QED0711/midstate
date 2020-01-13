import React from 'react';

// ROUTER
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import './App.css';

// STATE
import { StateProvider } from './state/StateProvider';
import { ConfigProvider } from './state/ConfigState'

// COMPONENTS
import MainContainer from './components/MainContainer';
import ConfigContainer from './components/ConfigContainer';

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider>
        <Switch>
          <Route exact path="/">
      
            <MainContainer />
      
          </Route>

          <Route exact path="/config">

            <ConfigContainer />

          </Route>

        </Switch>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
