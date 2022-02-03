import { ShellyPro2Pm } from 'shellies-ng';

import { DeviceHandler } from './base';
import { SwitchAbility } from '../abilities';

/**
 * Handles Shelly Pro 2 PM devices.
 */
export class ShellyPro2PmHandler extends DeviceHandler {
  protected setup() {
    const d = this.device as ShellyPro2Pm;

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

DeviceHandler.registerClass(ShellyPro2PmHandler, ShellyPro2Pm.model);
