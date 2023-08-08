import React from 'react';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

const AboutVgcHub = () => {
  return (
    <div>
    <Header />
    <div className="max-w-3xl mx-auto p-4"
        style={{ paddingTop: "100px" }}
    >
      <h2 className="text-2xl font-bold mb-4">About VGC Hub</h2>
      <p>
        Welcome to VGC Hub, your platform for connecting with Pokémon VGC players! Whether you're a seasoned competitive battler or just starting your journey in the competitive scene, VGC Hub is the place for you.
      </p>
      <p>
        This was first of all a project created by Gabu (<a
        className='text-blue-500 hover:underline'
        href="https://twitter.com/electhor94" target="_blank" rel="noopener noreferrer">@electhor94</a>) to progress in his learning as a developer.
      </p>
      <p>
        Our mission is to bring together trainers from around the world who share a passion for the Pokémon Video Game Championships (VGC). VGC Hub aims to foster an inclusive and supportive environment for players of all skill levels.
      </p>
      <p>
        Join us to discuss strategies, share insights, and stay up-to-date with the latest news and events in the Pokémon VGC world. From team building tips to grassroots tournament announcements, VGC Hub is your go-to destination for all things related to competitive Pokémon battling.
      </p>
      <p>
        Connect with trainers, engage in friendly battles, and expand your knowledge of the game. We're excited to have you on board and look forward to growing together as a vibrant and passionate community.
      </p>
      <a href="/signup" className="block text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
       Sign up today and become a part of the VGC Hub community!
      </a>
      <p className="mt-4">
        For inquiries, you can reach out to <a 
        className='text-blue-500 hover:underline'
        href="https://twitter.com/electhor94" target="_blank" rel="noopener noreferrer">Gabu</a> on Twitter.
      </p>
    </div>
    <Footer />
    </div>
  );
};

export default AboutVgcHub;
