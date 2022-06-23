import { ShellyPro2 } from 'shellies-ng';

import { DeviceHandler } from './base';
import { SwitchAbility } from '../abilities';

/**
 * Handles Shelly Pro 2 devices.
 */
export class ShellyPro2Handler extends DeviceHandler {
  protected setup() {
    const d = this.device as ShellyPro2;

    this.createAccessory(
      'switch-0',
      'Switch 1',
      new SwitchAbility(d.switch0),
    );

    this.createAccessory(
      'switch-1',
      'Switch 2',
      new SwitchAbility(d.switch1),
    );
  }
}

DeviceHandler.registerClass(ShellyPro2Handler, ShellyPro2);
