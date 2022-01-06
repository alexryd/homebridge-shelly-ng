import { API } from 'homebridge';

import { PLATFORM_NAME, ShellyPlatform } from './platform';

export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, ShellyPlatform);
};
