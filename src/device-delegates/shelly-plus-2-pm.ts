import { ShellyPlus2Pm } from 'shellies-ng';

import { DeviceDelegate } from './base';
import { CoverAbility, SwitchAbility } from '../abilities';

/**
 * Handles Shelly Plus 2 PM devices.
 */
export class ShellyPlus2PmDelegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPlus2Pm;
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

DeviceDelegate.registerClass(ShellyPlus2PmDelegate, ShellyPlus2Pm);
