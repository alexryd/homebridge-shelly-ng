import { ShellyPro1 } from 'shellies-ng';

import { DeviceDelegate } from './base';
import { SwitchAbility } from '../abilities';

/**
 * Handles Shelly Pro 1 devices.
 */
export class ShellyPro1Delegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPro1;

    this.createAccessory(
      'switch',
      null,
      new SwitchAbility(d.switch0),
    );
  }
}

DeviceDelegate.registerClass(ShellyPro1Delegate, ShellyPro1);
