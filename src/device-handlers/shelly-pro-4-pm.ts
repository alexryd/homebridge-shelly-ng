import { ShellyPro4Pm } from 'shellies-ng';

import { DeviceHandler } from './base';
import { SwitchAbility } from '../abilities';

/**
 * Handles Shelly Pro 4PM devices.
 */
export class ShellyPro4PmHandler extends DeviceHandler {
  protected setup() {
    const d = this.device as ShellyPro4Pm;

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

    this.createAccessory(
      'switch-2',
      'Switch 3',
      new SwitchAbility(d.switch2),
    );

    this.createAccessory(
      'switch-3',
      'Switch 4',
      new SwitchAbility(d.switch3),
    );
  }
}

DeviceHandler.registerClass(ShellyPro4PmHandler, ShellyPro4Pm.model);
