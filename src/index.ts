import { API } from 'homebridge';

import { ShellyPlatform } from './platform';

export = (api: API) => {
  api.registerPlatform('shelly-ng', ShellyPlatform);
};
