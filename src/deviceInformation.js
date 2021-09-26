import { ClientJS } from 'clientjs';

export default () => {
  const client = new ClientJS();

  return {
    colorDepth: client.getColorDepth(),
    resolution: client.getCurrentResolution(),
    plugins: client.getPlugins(),
    fonts: client.getFonts(),
    language: client.getLanguage(),
    systemLanguage: client.getSystemLanguage(),
  };
};
