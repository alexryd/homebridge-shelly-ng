import { ShellyPlus1 } from 'shellies-ng';

import { DeviceHandler } from './base';
import { SwitchAbility } from '../abilities';

/**
 * Handles Shelly Plus 1 devices.
 */
export class ShellyPlus1Handler extends DeviceHandler {
  protected setup() {
    const d = this.device as ShellyPlus1;

    this.createAccessory(
      'switch',
      null,
      new SwitchAbility(d.switch0),
    );
  }
}

DeviceHandler.registerClass(ShellyPlus1Handler, ShellyPlus1);
