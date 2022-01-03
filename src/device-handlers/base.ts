import { Device } from 'shellies-ng';

import { DeviceLogger } from '../utils/device-logger';
import { ShellyPlatform } from '../platform';

/**
 * A DeviceHandler manages accessories for a device.
 */
export class DeviceHandler {
  /**
   * Logger specific for this device.
   */
  protected readonly log: DeviceLogger;

  /**
   * @param device - The device to handle.
   * @param platform - A reference to the homebridge platform.
   */
  constructor(readonly device: Device, readonly platform: ShellyPlatform) {
    this.log = new DeviceLogger(device, platform.log);
    this.log.info('Device added');
  }

  /**
   * Destroys this device handler, removing all event listeners and unregistering all accessories.
   */
  destroy() {
    this.log.info('Device removed');
  }
}
