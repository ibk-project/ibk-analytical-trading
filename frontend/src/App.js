import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Market from './components/Market';
import EDA from './components/EDA';
import Portfolio from './components/Portfolio';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" exact={true} element={<Home />}></Route>
          <Route path="/market" element={<Market />}></Route>
          <Route path="/eda/*" element={<EDA />}></Route>
          <Route path="/portfolio" element={<Portfolio />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
