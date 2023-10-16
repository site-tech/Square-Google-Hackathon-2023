import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HomeComponent from './components/HomeComponent';
import ChatComponent from './components/ChatComponent';
import './App.css';

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navRef = useRef(null);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen)
  };

  const closeNav = (e) => {
    debugger;
    if (navRef.current && !navRef.current.contains(e.target)) {
      setIsNavOpen(false);
      // document.removeEventListener('mousedown', closeNav);
    }
  };

  useEffect(() => {
    debugger;
    document.addEventListener('mousedown', closeNav);
    return () => {
      document.removeEventListener('mousedown', closeNav);
    };
  }, []);

  return (
    <Router>
      <div className="app">
        <div className="header">
          <div className="menu-icon" onClick={toggleNav}>
            ☰
          </div>
          <h1 className="header-title">SiteTech Reservation AI</h1>
          <div className={`nav-slider ${isNavOpen ? 'show' : ''}`} ref={navRef} >
            <Link to="/" onClick={toggleNav}>
              Home
            </Link>
            <Link to="/chat" onClick={toggleNav}>
              Chat
            </Link>
          </div>
        </div>

        <div className="content">
          <Routes>
            <Route path="/" element={<HomeComponent />} />
            <Route path="/chat" element={<ChatComponent />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
