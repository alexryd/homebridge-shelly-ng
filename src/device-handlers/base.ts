import { Device } from 'shellies-ng';

import { ShellyPlatform } from '../platform';

/**
 * A DeviceHandler manages accessories for a device.
 */
export class DeviceHandler {
  /**
   * @param device - The device to handle.
   * @param platform - A reference to the homebridge platform.
   */
  constructor(readonly device: Device, readonly platform: ShellyPlatform) {
  }

  /**
   * Destroys this device handler, removing all event listeners and unregistering all accessories.
   */
  destroy() {
    // ...
  }
}
