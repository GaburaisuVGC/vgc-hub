import React, { useState } from 'react';
import Header from '../components/Header';
import HomePage from '../components/HomePage';
import Sidebar from '../components/Sidebar';
import { FiSearch } from 'react-icons/fi'; 
import Footer from '../components/Footer';

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div>
      <Header />

      <div className="lg:flex">
        {/* Homepage */}
        <div className={`w-full lg:w-2/3 p-4 ${sidebarOpen ? 'hidden lg:block' : ''}`}>
          <HomePage />
        </div>

        {/* Sidebar */}
        <div className={`w-full lg:w-1/3 p-4 fixed right-0 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
          <Sidebar />
        </div>
      </div>

      {/* Burger Menu */}
      <div className="lg:hidden p-4 fixed bottom-0 right-0 z-50">
      <button
          onClick={toggleSidebar}
          className="p-2 bg-blue-500 rounded text-white"
        >
          <FiSearch size={24} /> {/* Utilisation de l'icône de recherche */}
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
