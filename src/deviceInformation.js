import { ClientJS } from 'clientjs';

export default () => {
  const client = new ClientJS();

  return {
    colorDepth: client.getColorDepth(),
    resolution: client.getCurrentResolution(),
    availableResolution: client.getAvailableResolution(),
    plugins: client.getPlugins(),
    fonts: client.getFonts(),
    language: client.getLanguage(),
    systemLanguage: client.getSystemLanguage(),
  };
};
