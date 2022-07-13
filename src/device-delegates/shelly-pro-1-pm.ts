import { ShellyPro1Pm } from 'shellies-ng';

import { DeviceDelegate } from './base';
import { SwitchAbility } from '../abilities';

/**
 * Handles Shelly Pro 1 PM devices.
 */
export class ShellyPro1PmDelegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPro1Pm;

    this.createAccessory(
      'switch',
      null,
      new SwitchAbility(d.switch0),
    );
  }
}

DeviceDelegate.registerClass(ShellyPro1PmDelegate, ShellyPro1Pm);
