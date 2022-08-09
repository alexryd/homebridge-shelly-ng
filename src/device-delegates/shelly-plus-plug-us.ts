import { ShellyPlusPlugUs } from 'shellies-ng';

import { DeviceDelegate } from './base';

/**
 * Handles Shelly Plus Plug US devices.
 */
export class ShellyPlusPlugUsDelegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPlusPlugUs;

    this.createSwitch(d.switch0, true);
  }
}

DeviceDelegate.registerDelegate(ShellyPlusPlugUsDelegate, ShellyPlusPlugUs);
