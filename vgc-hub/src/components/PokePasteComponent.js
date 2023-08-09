import React, { useState, useEffect } from 'react';
import axios from 'axios';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PokePasteComponent = ({ pageCode }) => {
  const [pasteData, setPasteData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/pokepaste/get/${pageCode}`);
        setPasteData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [pageCode]);

  const handleComponentClick = (e) => {
    e.stopPropagation(); // Prevent propagation of the click event
  };

  return (
    <a
      href={`https://pokepast.es/${pageCode}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleComponentClick}
      className="block" // Make the link cover the whole div
    >
      <div className="bg-gray-100 p-4 rounded-lg" onClick={handleComponentClick}>
        {pasteData && (
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-1">{pasteData.pasteTitle}</h2>
            <p className="text-gray-600 text-sm mb-1">{pasteData.author}</p>
            <p className="text-gray-600 text-sm mb-4">{pasteData.format}</p>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1">
          {pasteData &&
            pasteData.pokemonNames.map((pokemonName, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center"
              >
                <div className="relative">
                  <img
                    src={`https://pokepast.es/img/pokemon/${pokemonName}.png`}
                    alt={pokemonName}
                    className="w-12 h-12"
                  />
                  <img
                    src={`https://pokepast.es${pasteData.itemImages[index]}`}
                    alt=""
                    className="w-6 h-6 absolute bottom-0 right-0"
                    style={{ transform: 'translate(25%, 25%)' }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </a>
  );
};

export default PokePasteComponent;
