import { ShellyPlus1 } from 'shellies-ng';

import { DeviceDelegate } from './base';

/**
 * Handles Shelly Plus 1 devices.
 */
export class ShellyPlus1Delegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPlus1;

    this.createSwitch(d.switch0, true);
  }
}

DeviceDelegate.registerClass(ShellyPlus1Delegate, ShellyPlus1);
