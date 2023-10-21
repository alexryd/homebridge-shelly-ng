import {
  ShellyPlus1,
  ShellyPlus1Ul,
  ShellyPlus1Mini,
} from 'shellies-ng';

import { DeviceDelegate } from './base';

/**
 * Handles Shelly Plus 1 devices.
 */
export class ShellyPlus1Delegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPlus1;

    this.addSwitch(d.switch0, { single: true });
  }
}

DeviceDelegate.registerDelegate(
  ShellyPlus1Delegate,
  ShellyPlus1,
  ShellyPlus1Ul,
  ShellyPlus1Mini,
);
