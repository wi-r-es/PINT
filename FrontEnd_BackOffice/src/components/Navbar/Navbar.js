import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import { FaUserCircle, FaBell } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-body-tertiary">
      <div className="container-fluid">
        <a className="navbar-brand align-items-center" href="/homepage">Home</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
          <ul className="navbar-nav align-items-center">
            <li className="nav-item">
              <a className="nav-link" href="/posts">Publications</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/events">Events</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/albums">Albums</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <div 
                  className={`language ${selectedLanguage === 'pt' ? 'selected' : ''}`} 
                  onClick={() => handleLanguageChange('pt')}
                >
                  pt
                </div>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <div 
                  className={`language ${selectedLanguage === 'en' ? 'selected' : ''}`} 
                  onClick={() => handleLanguageChange('en')}
                >
                  en
                </div>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <div 
                  className={`language ${selectedLanguage === 'sp' ? 'selected' : ''}`} 
                  onClick={() => handleLanguageChange('sp')}
                >
                  sp
                </div>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/manage">Manage</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/dashboard">Dashboard</a>
            </li>
          </ul>
          <h1 className="navbar-text mx-auto d-none d-lg-block">Soft<span className="text-primary">Shares</span></h1>
          <ul className="navbar-nav align-items-center">
            <li className="nav-item d-flex align-items-center">
              <a className="nav-link" href="/profile">
                <FaUserCircle size="1.5em" className="me-3 softinsa_icon" />
              </a>
            </li>
            <li className="nav-item d-flex align-items-center">
            <FaBell size="1.5em" className="me-3" />
            </li>
            <li className="nav-item">
              <form className="d-flex" role="search">
                <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                <button disabled={true} className="btn btn-secondary softinsaaButtonDisabled" type="submit">Search</button>
              </form>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
