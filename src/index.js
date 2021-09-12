import Bowser from 'bowser';
import MobileDetect from 'mobile-detect';
import { getGPUTier } from 'detect-gpu';
import arch from 'arch';
import { load as loadRecaptch } from 'recaptcha-v3';
import mixpanel from 'mixpanel-browser';

import './index.css';

import detectLocales from './detectLocales';
import detectIP from './detectIP';

const { userAgent } = global.window.navigator;

const browserInfo = Bowser.parse(userAgent);
const mobileDetect = new MobileDetect(userAgent);

const GOOGLE_RECAPTCHA_CLINET_KEY = '6LdGdWAcAAAAAEF35C0ktqSzfA8O1nSxw5W1u3e0';

Promise.allSettled([
  getGPUTier(),
  loadRecaptch(GOOGLE_RECAPTCHA_CLINET_KEY)
    .then(({ recaptcha }) => new Promise((resolve) => recaptcha.ready(() => resolve(recaptcha))))
    .then(({ execute }) => execute()),
  detectIP(),
]).then(([gpuChunk, recaptchaChunk, ipChunk]) => {
  const result = {
    ...browserInfo,
    mobile: {
      name: mobileDetect.mobile() || mobileDetect.phone(),
      os: mobileDetect.os(),
      isBot: mobileDetect.is('bot') || mobileDetect.is('MobileBot'),
      isDesktopMode: mobileDetect.is('DesktopMode'),
    },
    cpu: {
      architecture: arch(),
    },
    gpu: {
      value: gpuChunk.status === 'fulfilled'
        ? gpuChunk.value.gpu
        : gpuChunk.reason,
      error: gpuChunk.reason,
    },
    recaptchaV3: {
      error: recaptchaChunk.reason,
      value: recaptchaChunk.value,
    },
    userAgent,
    locales: detectLocales(),
    ipEntity: {
      error: ipChunk.reason,
      value: ipChunk.value,
    },
  };

  if (__DEV__) {
    console.log(result);
  }

  if (__PROD__) {
    mixpanel.init('92e1a0bbceac0cee4d87952d33b3db91');
    mixpanel.track('DT.Connector completed to collection info by user', result);
  }
});
