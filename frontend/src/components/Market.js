import React, { useState, useEffect } from "react";
import './css/Market.css';
import MarketIndex from './MarketIndex';
import MarketSector from "./MarketSector";

function Market() {
  
  
  return (
    <div>
      <div className="market-container">    
        <MarketIndex />
        <MarketSector />
      </div>
    </div>
  );
}

export default Market;