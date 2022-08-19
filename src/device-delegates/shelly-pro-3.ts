import { ShellyPro3 } from 'shellies-ng';

import { DeviceDelegate } from './base';

/**
 * Handles Shelly Pro 3 devices.
 */
export class ShellyPro3Delegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPro3;

    this.addSwitch(d.switch0);
    this.addSwitch(d.switch1);
    this.addSwitch(d.switch2);
  }
}

DeviceDelegate.registerDelegate(ShellyPro3Delegate, ShellyPro3);
