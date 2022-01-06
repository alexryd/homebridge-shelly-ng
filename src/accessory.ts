import { PlatformAccessory } from 'homebridge';

/**
 * Represents a HomeKit accessory.
 */
export class ShellyAccessory {
  /**
   * @param platformAccessory - The underlying homebridge platform accessory.
   */
  constructor(readonly platformAccessory: PlatformAccessory) {
  }

  /**
   * Removes all event listeners from this accessory.
   */
  detach() {
    // ...
  }
}
