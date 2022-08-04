import './css/Header.css';
import {useState} from 'react';
import {Link, useLocation} from 'react-router-dom';

function Header() {
  const [currentTab, setCurrentTab] = useState(useLocation().pathname);
  const linkStyle = (linkTab) => {
    if(currentTab === linkTab) return {"fontWeight": "bold"};
  }
  const handleCurrentTab = (linkTab) => {
    setCurrentTab(linkTab);
  }
  return(
    <header className="main_top">
      <div className="header1">
        <Link to="/" className="header-title">IBKAT | IBK Analytical Trading System</Link>
      </div>
      <div className="header2">
        <ul>
          <li>
            <Link style={linkStyle("/")} onClick={() => {handleCurrentTab("/")}} to="/">Home</Link>
          </li>
          <li>
            <Link style={linkStyle("/market")} onClick={() => {handleCurrentTab("/market")}} to="/market">Market</Link>
          </li>
          <li>
            <Link style={linkStyle("/eda")} onClick={() => {handleCurrentTab("/eda")}} to="/eda">EDA</Link>
          </li>
          <li>
            <Link style={linkStyle("/portfolio")} onClick={() => {handleCurrentTab("/portfolio")}} to="/portfolio">Portfolio</Link>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Header;