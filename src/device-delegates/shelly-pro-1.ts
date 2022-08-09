import { ShellyPro1 } from 'shellies-ng';

import { DeviceDelegate } from './base';

/**
 * Handles Shelly Pro 1 devices.
 */
export class ShellyPro1Delegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPro1;

    this.createSwitch(d.switch0, true);
  }
}

DeviceDelegate.registerDelegate(ShellyPro1Delegate, ShellyPro1);
