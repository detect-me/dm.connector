/* eslint-disable no-underscore-dangle */
import Bowser from 'bowser';
import { getGPUTier } from 'detect-gpu';
import { load as loadRecaptch } from 'recaptcha-v3';
import { decrypt, encrypt } from 'dm.crypter';
import { ENCRYPT_HASH_KEY, ENCRYPT_IV_KEY } from 'dm.secrets';

import './index.css';

import BotDetector from './BotDetector';
import getDeviceInformation from './deviceInformation';
import { GOOGLE_RECAPTCHA_CLINET_KEY, API_HOST } from './constants';

const { userAgent } = global.window.navigator;

const browserInfo = Bowser.parse(userAgent);

Promise.allSettled([
  getGPUTier(),
  loadRecaptch(GOOGLE_RECAPTCHA_CLINET_KEY, { autoHideBadge: true })
    .then(({ recaptcha }) => new Promise((resolve) => recaptcha.ready(() => resolve(recaptcha))))
    .then(({ execute }) => execute()),
  new Promise((resolve) => (
    new BotDetector({
      timeout: 1000,
      callback: resolve,
    }).monitor()
  )),
])
  .then(([gpuChunk, recaptchaChunk, botDetector]) => {
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
      search: global.window.location.search,
      botDetector: {
        cases: botDetector.value.cases,
        detected: botDetector.value.detected,
        isBot: botDetector.value.isBot,
      },
    };

    if (__DEV__) {
      console.log(result);
    }

    return fetch(
      `${API_HOST}/api/user`,
      {
        headers: {
          'X-USER-KEY': encrypt(
            JSON.stringify(result),
            ENCRYPT_HASH_KEY,
            ENCRYPT_IV_KEY,
          ),
          'X-API-KEY': global.window.__DM_API_KEY__,
        },
        credentials: 'include',
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
  .catch(() => {
    const dmScreen = document.querySelector('.dm-screen');

    if (dmScreen) {
      dmScreen.classList.add('hide');
    }
  });
