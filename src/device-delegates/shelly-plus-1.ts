import {
  ShellyPlus1,
  ShellyPlus1Ul,
} from 'shellies-ng';

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

DeviceDelegate.registerDelegate(
  ShellyPlus1Delegate,
  ShellyPlus1,
  ShellyPlus1Ul,
);
