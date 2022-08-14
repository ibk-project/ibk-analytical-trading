import React from 'react'
import { Link } from 'react-router-dom';
import './css/Footer.css';

function Footer() {
    return (
        <div className='footer-container'>
            <div className='footer-links'>
                <div className='footer-link-wrapper'>
                    <div className='footer-link-items'>
                        <h2>About Us</h2>
                        <Link to='/'>Goal & Vision</Link>
                        <Link to='/'>Developers</Link>
                        <Link to='/'>Terms of Service</Link>
                    </div>
                </div>
                <div className='footer-link-wrapper'>
                    <div className='footer-link-items'>
                        <h2>How to use</h2> {/* 사용 방법 영상 넣기 */}
                        <Link to='/'>Home</Link>
                        <Link to='/'>Market</Link>
                        <Link to='/'>EDA</Link>
                        <Link to='/'>Portfolio</Link>
                    </div>
                    <div className='footer-link-items'>
                        <h2>IBK Pages</h2>
                        <a href="https://www.ibks.com/" target="_blank" >Home Page</a>
                        <a href="https://www.youtube.com/channel/UCLLM5pzQAfys9KpBP91b3_A" target="_blank" >Youtube</a>
                        <a href="https://www.linkedin.com/company/ibk-securities/mycompany/" target="_blank" >LinkedIn</a>
                    </div>
                </div>
            </div>
            <section className="social-media">
                <div className="social-media-wrap">
                    <small className="website-rights">SKKU SW - IBK Securites Co. LTD © 2022</small><br/>
                    <small className="website-rights">Created by KMC, PJY, SYB, LKT, CSH</small>
                </div>
            </section>
        </div>
    )
}

export default Footer