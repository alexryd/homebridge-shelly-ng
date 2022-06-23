import { ShellyPlus1Pm } from 'shellies-ng';

import { DeviceHandler } from './base';
import { SwitchAbility } from '../abilities';

/**
 * Handles Shelly Plus 1PM devices.
 */
export class ShellyPlus1PmHandler extends DeviceHandler {
  protected setup() {
    const d = this.device as ShellyPlus1Pm;

    this.createAccessory(
      'switch',
      null,
      new SwitchAbility(d.switch0),
    );
  }
}

DeviceHandler.registerClass(ShellyPlus1PmHandler, ShellyPlus1Pm);
