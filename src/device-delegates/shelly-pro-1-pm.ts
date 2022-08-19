import {
  ShellyPro1Pm,
  ShellyPro1PmRev1,
  ShellyPro1PmRev2,
} from 'shellies-ng';

import { DeviceDelegate } from './base';

/**
 * Handles Shelly Pro 1 PM devices.
 */
export class ShellyPro1PmDelegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPro1Pm;

    this.addSwitch(d.switch0, { single: true });
  }
}

DeviceDelegate.registerDelegate(
  ShellyPro1PmDelegate,
  ShellyPro1Pm,
  ShellyPro1PmRev1,
  ShellyPro1PmRev2,
);
