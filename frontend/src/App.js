import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import EDA from './components/EDA';
import Portfolio from './components/Portfolio';
import BackTesting from './components/BackTesting';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" exact={true} element={<Home />}></Route>
          <Route path="/eda" element={<EDA />}></Route>
          <Route path="/portfolio" element={<Portfolio />}></Route>
          <Route path="/backtesting" element={<BackTesting />}></Route>
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
