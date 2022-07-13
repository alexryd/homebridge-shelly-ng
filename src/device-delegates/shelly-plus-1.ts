import { ShellyPlus1 } from 'shellies-ng';

import { DeviceDelegate } from './base';
import { SwitchAbility } from '../abilities';

/**
 * Handles Shelly Plus 1 devices.
 */
export class ShellyPlus1Delegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPlus1;

    this.createAccessory(
      'switch',
      null,
      new SwitchAbility(d.switch0),
    );
  }
}

DeviceDelegate.registerClass(ShellyPlus1Delegate, ShellyPlus1);
