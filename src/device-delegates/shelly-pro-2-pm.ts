import {
  ShellyPro2Pm,
  ShellyPro2PmRev1,
  ShellyPro2PmRev2,
} from 'shellies-ng';

import { DeviceDelegate } from './base';

/**
 * Handles Shelly Pro 2 PM devices.
 */
export class ShellyPro2PmDelegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPro2Pm;
    const isCover = d.profile === 'cover';

    this.addCover(d.cover0, { active: isCover });

    this.addSwitch(d.switch0, { active: !isCover });
    this.addSwitch(d.switch1, { active: !isCover });
  }
}

DeviceDelegate.registerDelegate(
  ShellyPro2PmDelegate,
  ShellyPro2Pm,
  ShellyPro2PmRev1,
  ShellyPro2PmRev2,
);
