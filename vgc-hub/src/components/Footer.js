import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 md:py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Première colonne */}
        <div className="col-span-1 md:col-span-1 text-center md:text-left md:pl-4">
          <Link to="/" className="navbar-logo md:text-3xl mb-8 text-2xl text-white">VGC Hub</Link>
          {/* <a href="https://github.com/GaburaisuVGC" target="_blank" rel="noopener noreferrer" className="block mb-2">
            GitHub
          </a> */}
          <a href="https://twitter.com/electhor94" target="_blank" rel="noopener noreferrer" className="block">
            Twitter
          </a>
        </div>

        {/* Deuxième colonne */}
        <div className="col-span-1 md:col-span-1 text-center md:text-left">
          <h2 className="text-lg md:text-xl font-semibold mb-4">About Us</h2>
          <ul>
            <li>
              <a href="/about">About VGC Hub</a>
            </li>
            <li>
              <a href="/qa">Q/A</a>
            </li>
          </ul>
        </div>

        {/* Troisième colonne */}
        <div className="col-span-1 md:col-span-1 text-center md:text-left">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Informations</h2>
          <ul>
            <li>
              <a href="/gdpr">GDPR</a>
            </li>
            <li>
              <a href="/privacy">Privacy</a>
            </li>
            <li>
              <a href="/signup">Sign Up</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto text-center mt-6">
        <p>2023 VGC Hub. v0.1.0</p>
      </div>
    </footer>
  );
};

export default Footer;
