import React from 'react';
import './App.css';

// STATE
import {StateProvider} from './state/StateProvider';

// COMPONENTS
import MainContainer from './components/MainContainer';

function App() {
  return (
    <StateProvider>
      <div className="App">
        <MainContainer />
      </div>
    </StateProvider>
  );
}

export default App;
