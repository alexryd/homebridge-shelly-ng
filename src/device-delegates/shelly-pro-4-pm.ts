import { ShellyPro4Pm } from 'shellies-ng';

import { DeviceDelegate } from './base';

/**
 * Handles Shelly Pro 4PM devices.
 */
export class ShellyPro4PmDelegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPro4Pm;

    this.createSwitch(d.switch0);
    this.createSwitch(d.switch1);
    this.createSwitch(d.switch2);
    this.createSwitch(d.switch3);
  }
}

DeviceDelegate.registerClass(ShellyPro4PmDelegate, ShellyPro4Pm);
