const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

router.get('/get/:pageCode', async (req, res) => {
  const pageCode = req.params.pageCode;

  try {
    const response = await axios.get(`https://pokepast.es/${pageCode}`);
    const html = response.data;
    const $ = cheerio.load(html);

    const pokemonNames = [];
    const pasteTitle = $('title').text();
    const author = $('h2').text().replace(/\s+/g, ' ').trim(); // Remove extra spaces
    const format = $('p').text();

    $('.img-pokemon').each((index, element) => {
      const imgSrc = $(element).attr('src');
      const imgPath = imgSrc.split('/').slice(-1)[0];
      const pokemonName = imgPath.split('.')[0]; // Extract the name before the ".png"
      pokemonNames.push(pokemonName);
    });

    const itemImages = $('.img-item').map((index, element) => $(element).attr('src')).get();

    res.json({ pokemonNames, pasteTitle, author, format, itemImages });
  } catch (error) {
    console.error('Error scraping:', error);
    res.status(500).json({ error: 'An error occurred while scraping data.' });
  }
});

module.exports = router;
