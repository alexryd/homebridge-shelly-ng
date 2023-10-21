import {
  ShellyPlus1Pm,
  ShellyPlus1PmUl,
  ShellyPlus1PmMini,
} from 'shellies-ng';

import { DeviceDelegate } from './base';

/**
 * Handles Shelly Plus 1PM devices.
 */
export class ShellyPlus1PmDelegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPlus1Pm;

    this.addSwitch(d.switch0, { single: true });
  }
}

DeviceDelegate.registerDelegate(
  ShellyPlus1PmDelegate,
  ShellyPlus1Pm,
  ShellyPlus1PmUl,
  ShellyPlus1PmMini,
);
