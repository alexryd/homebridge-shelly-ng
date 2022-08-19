import {
  ShellyPro2,
  ShellyPro2Rev1,
  ShellyPro2Rev2,
} from 'shellies-ng';

import { DeviceDelegate } from './base';

/**
 * Handles Shelly Pro 2 devices.
 */
export class ShellyPro2Delegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPro2;

    this.addSwitch(d.switch0);
    this.addSwitch(d.switch1);
  }
}

DeviceDelegate.registerDelegate(
  ShellyPro2Delegate,
  ShellyPro2,
  ShellyPro2Rev1,
  ShellyPro2Rev2,
);
