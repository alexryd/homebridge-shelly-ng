import { ShellyPro1 } from 'shellies-ng';

import { DeviceHandler } from './base';
import { SwitchAbility } from '../abilities';

/**
 * Handles Shelly Pro 1 devices.
 */
export class ShellyPro1Handler extends DeviceHandler {
  protected setup() {
    const d = this.device as ShellyPro1;

    this.createAccessory(
      'switch',
      null,
      new SwitchAbility(d.switch0),
    );
  }
}

DeviceHandler.registerClass(ShellyPro1Handler, ShellyPro1);
