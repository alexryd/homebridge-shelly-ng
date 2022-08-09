import { ShellyPro3 } from 'shellies-ng';

import { DeviceDelegate } from './base';

/**
 * Handles Shelly Pro 3 devices.
 */
export class ShellyPro3Delegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPro3;

    this.createSwitch(d.switch0);
    this.createSwitch(d.switch1);
    this.createSwitch(d.switch2);
  }
}

DeviceDelegate.registerDelegate(ShellyPro3Delegate, ShellyPro3);
