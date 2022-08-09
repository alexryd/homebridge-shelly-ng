import { ShellyPlus2Pm } from 'shellies-ng';

import { DeviceDelegate } from './base';

/**
 * Handles Shelly Plus 2 PM devices.
 */
export class ShellyPlus2PmDelegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPlus2Pm;
    const isCover = d.profile === 'cover';

    this.createCover(d.cover0).setActive(isCover);

    this.createSwitch(d.switch0).setActive(!isCover);
    this.createSwitch(d.switch1).setActive(!isCover);
  }
}

DeviceDelegate.registerDelegate(ShellyPlus2PmDelegate, ShellyPlus2Pm);
