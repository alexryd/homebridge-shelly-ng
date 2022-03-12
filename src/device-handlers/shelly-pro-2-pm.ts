import { ShellyPro2Pm } from 'shellies-ng';

import { DeviceHandler } from './base';
import { CoverAbility, SwitchAbility } from '../abilities';

/**
 * Handles Shelly Pro 2 PM devices.
 */
export class ShellyPro2PmHandler extends DeviceHandler {
  protected setup() {
    const d = this.device as ShellyPro2Pm;
    const isCover = d.profile === 'cover';

    this.createAccessory(
      'cover',
      'Window',
      new CoverAbility(d.cover0, 'window'),
    ).setActive(isCover);

    this.createAccessory(
      'switch-0',
      'Switch 1',
      new SwitchAbility(d.switch0),
    ).setActive(!isCover);

    this.createAccessory(
      'switch-1',
      'Switch 2',
      new SwitchAbility(d.switch1),
    ).setActive(!isCover);
  }
}

DeviceHandler.registerClass(ShellyPro2PmHandler, ShellyPro2Pm.model);
