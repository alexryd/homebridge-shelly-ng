import { ShellyPro2Pm } from 'shellies-ng';

import { DeviceDelegate } from './base';
import { CoverAbility } from '../abilities';

/**
 * Handles Shelly Pro 2 PM devices.
 */
export class ShellyPro2PmDelegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPro2Pm;
    const isCover = d.profile === 'cover';

    this.createAccessory(
      'cover',
      'Window',
      new CoverAbility(d.cover0, 'window'),
    ).setActive(isCover);

    this.createSwitch(d.switch0).setActive(!isCover);
    this.createSwitch(d.switch1).setActive(!isCover);
  }
}

DeviceDelegate.registerClass(ShellyPro2PmDelegate, ShellyPro2Pm);
