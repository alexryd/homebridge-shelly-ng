import { ShellyPro1Pm } from 'shellies-ng';

import { DeviceHandler } from './base';
import { SwitchAbility } from '../abilities';

/**
 * Handles Shelly Pro 1 PM devices.
 */
export class ShellyPro1PmHandler extends DeviceHandler {
  protected setup() {
    const d = this.device as ShellyPro1Pm;

    this.createAccessory(
      'switch',
      null,
      new SwitchAbility(d.switch0),
    );
  }
}

DeviceHandler.registerClass(ShellyPro1PmHandler, ShellyPro1Pm);
