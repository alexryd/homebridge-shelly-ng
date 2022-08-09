import { ShellyPro2Pm } from 'shellies-ng';

import { DeviceDelegate } from './base';

/**
 * Handles Shelly Pro 2 PM devices.
 */
export class ShellyPro2PmDelegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPro2Pm;
    const isCover = d.profile === 'cover';

    this.createCover(d.cover0).setActive(isCover);

    this.createSwitch(d.switch0).setActive(!isCover);
    this.createSwitch(d.switch1).setActive(!isCover);
  }
}

DeviceDelegate.registerDelegate(ShellyPro2PmDelegate, ShellyPro2Pm);
