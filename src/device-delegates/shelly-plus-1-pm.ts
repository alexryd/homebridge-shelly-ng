import { ShellyPlus1Pm } from 'shellies-ng';

import { DeviceDelegate } from './base';
import { SwitchAbility } from '../abilities';

/**
 * Handles Shelly Plus 1PM devices.
 */
export class ShellyPlus1PmDelegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPlus1Pm;

    this.createAccessory(
      'switch',
      null,
      new SwitchAbility(d.switch0),
    );
  }
}

DeviceDelegate.registerClass(ShellyPlus1PmDelegate, ShellyPlus1Pm);
