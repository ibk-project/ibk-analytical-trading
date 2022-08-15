import './css/Header.css';
import { NavLink } from 'react-router-dom';

function Header() {
  return(
    <header className="main_top">
      <div className="header1">
        <NavLink to="/" className="header-title" activeclassname="active-title">IBKAT | IBK Analytical Trading System</NavLink>
      </div>
      <div className="header2">
        <ul>
          <li>
            <NavLink to="/" activeclassname="active">Home</NavLink>
          </li>
          <li>
            <NavLink to="/market" activeclassname="active">Market</NavLink>
          </li>
          <li>
            <NavLink to="/eda" activeclassname="active">EDA</NavLink>
          </li>
          <li>
            <NavLink to="/portfolio" activeclassname="active">Portfolio</NavLink>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Header;