import './css/Header.css';
import {Link} from 'react-router-dom';

function Header() {
  return(
    <header className="main_top">
      <div className="header1">
        <Link to="/" className="header-title">SKKU-IBK Portfolio Recommendation System</Link>
      </div>
      <div className="header2">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/eda">EDA</Link>
          </li>
          <li>
            <Link to="/portfolio">Portfolio</Link>
          </li>
          <li>
            <Link to="/backtesting">BackTesting</Link>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Header;