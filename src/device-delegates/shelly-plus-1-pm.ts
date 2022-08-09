import {
  ShellyPlus1Pm,
  ShellyPlus1PmUl,
} from 'shellies-ng';

import { DeviceDelegate } from './base';

/**
 * Handles Shelly Plus 1PM devices.
 */
export class ShellyPlus1PmDelegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPlus1Pm;

    this.createSwitch(d.switch0, true);
  }
}

DeviceDelegate.registerDelegate(
  ShellyPlus1PmDelegate,
  ShellyPlus1Pm,
  ShellyPlus1PmUl,
);
