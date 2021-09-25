/* eslint-disable no-underscore-dangle */
import Bowser from 'bowser';
import { getGPUTier } from 'detect-gpu';
import { load as loadRecaptch } from 'recaptcha-v3';
import { decrypt, encrypt } from 'dm.crypter';
import { ENCRYPT_HASH_KEY, ENCRYPT_IV_KEY } from 'dm.secrets';

import getDeviceInformation from './deviceInformation';
import './index.css';

import { GOOGLE_RECAPTCHA_CLINET_KEY, API_HOST } from './constants';

const { userAgent } = global.window.navigator;

const browserInfo = Bowser.parse(userAgent);

Promise.allSettled([
  getGPUTier(),
  loadRecaptch(GOOGLE_RECAPTCHA_CLINET_KEY, { autoHideBadge: true })
    .then(({ recaptcha }) => new Promise((resolve) => recaptcha.ready(() => resolve(recaptcha))))
    .then(({ execute }) => execute()),
])
  .then(([gpuChunk, recaptchaChunk]) => {
    const result = {
      ...browserInfo,
      device: getDeviceInformation(),
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
    };

    return fetch(
      `${API_HOST}/api/user`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-USER-KEY': encrypt(
            JSON.stringify(result),
            ENCRYPT_HASH_KEY,
            ENCRYPT_IV_KEY,
          ),
          'X-API-KEY': global.window.__DM_API_KEY__,
        },
      },
    );
  })
  .then((response) => {
    if (response.status === 200) {
      return response.json();
    }

    return Promise.reject();
  })
  .then(({ app }) => {
    const body = global.document.querySelector('body');

    body.innerHTML += decrypt(
      app,
      ENCRYPT_HASH_KEY,
      ENCRYPT_IV_KEY,
    );
  })
  .finally(() => {
    const dmScreen = document.querySelector('.dm-screen');

    if (dmScreen) {
      dmScreen.classList.add('hide');
    }
  });
