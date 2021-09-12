export default () => fetch('http://ip-api.com/json/')
  .then((response) => response.json())
  .then(({ query: ip, ...ipEntity }) => ({
    ...ipEntity,
    ip,
  }))
  .catch((error) => error.message);
