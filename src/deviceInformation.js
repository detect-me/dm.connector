import { ClientJS } from 'clientjs';

export default () => {
  const client = new ClientJS();

  return {
    colorDepth: client.getColorDepth(),
    resolution: client.getCurrentResolution(),
    getAvailableResolution: client.getAvailableResolution(),
    getDeviceXDPI: client.getDeviceXDPI(),
    getDeviceYDPI: client.getDeviceYDPI(),

    getPlugins: client.getPlugins(),
    isJava: client.isJava(),
    isSilverlight: client.isSilverlight(),
    getSilverlightVersion: client.getSilverlightVersion(),

    isFont: client.isFont(),
    getFonts: client.getFonts(),

    isLocalStorage: client.isLocalStorage(),
    isSessionStorage: client.isSessionStorage(),
    isCookie: client.isCookie(),

    getTimeZone: client.getTimeZone(),

    getLanguage: client.getLanguage(),
    getSystemLanguage: client.getSystemLanguage(),
  };
};
