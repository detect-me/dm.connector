import Bowser from 'bowser';
import { getGPUTier } from 'detect-gpu';
import arch from 'arch';
import { load as loadRecaptch } from 'recaptcha-v3';
import mixpanel from 'mixpanel-browser';

import './index.css';

import detectIP from './detectIP';
import getDeviceInformation from './deviceInformation';

const { userAgent } = global.window.navigator;

const browserInfo = Bowser.parse(userAgent);

const GOOGLE_RECAPTCHA_CLINET_KEY = '6LdGdWAcAAAAAEF35C0ktqSzfA8O1nSxw5W1u3e0';

Promise.allSettled([
  getGPUTier(),
  loadRecaptch(GOOGLE_RECAPTCHA_CLINET_KEY, { autoHideBadge: true })
    .then(({ recaptcha }) => new Promise((resolve) => recaptcha.ready(() => resolve(recaptcha))))
    .then(({ execute }) => execute()),
  detectIP(),
])
  .then(([gpuChunk, recaptchaChunk, ipChunk]) => {
    const result = {
      ...browserInfo,
      device: getDeviceInformation(),
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
      ipEntity: {
        error: ipChunk.reason,
        value: ipChunk.value,
      },
    };

    if (__DEV__) {
      console.log(result);
    }

    if (__PROD__) {
      mixpanel.init('7c0d9a14a55481b294bf9e636499dd2f');
      mixpanel.track('DT.Connector completed grabbing info by user', result);
    }
  })
  .finally(() => {
    const dtScreen = document.querySelector('.dt-screen');

    if (dtScreen) {
      dtScreen.classList.add('hide');
    }
  });
