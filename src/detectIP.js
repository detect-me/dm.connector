const API_KEY = 'f0e8226186294d0a89590aaccbe10377';

export default () => fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}`)
  .then((response) => response.json())
  .catch((error) => error.message);
