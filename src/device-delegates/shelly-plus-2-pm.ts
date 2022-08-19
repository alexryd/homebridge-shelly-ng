import {
  ShellyPlus2Pm,
  ShellyPlus2PmRev1,
} from 'shellies-ng';

import { DeviceDelegate } from './base';

/**
 * Handles Shelly Plus 2 PM devices.
 */
export class ShellyPlus2PmDelegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPlus2Pm;
    const isCover = d.profile === 'cover';

    this.addCover(d.cover0, { active: isCover });

    this.addSwitch(d.switch0, { active: !isCover });
    this.addSwitch(d.switch1, { active: !isCover });
  }
}

DeviceDelegate.registerDelegate(
  ShellyPlus2PmDelegate,
  ShellyPlus2Pm,
  ShellyPlus2PmRev1,
);
