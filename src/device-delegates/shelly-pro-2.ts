import { ShellyPro2 } from 'shellies-ng';

import { DeviceDelegate } from './base';

/**
 * Handles Shelly Pro 2 devices.
 */
export class ShellyPro2Delegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPro2;

    this.createSwitch(d.switch0);
    this.createSwitch(d.switch1);
  }
}

DeviceDelegate.registerClass(ShellyPro2Delegate, ShellyPro2);
