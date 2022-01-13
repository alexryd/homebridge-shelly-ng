import { Service } from 'homebridge';

import { Device } from 'shellies-ng';

import { Ability } from './base';

/**
 * Handles the AccessoryInformation service.
 */
export class AccessoryInformationAbility extends Ability {
  /**
   * @param device - The associated device.
   */
  constructor(readonly device: Device) {
    super();
  }

  protected setupService(): Service {
    // extract the MAC from the device ID
    const m = this.device.id.match(/[A-Fa-f0-9]+$/);
    const serialNumber = m !== null ? m[0] : this.device.id;

    return this.getOrAddService(this.Service.AccessoryInformation)
      .setCharacteristic(this.Characteristic.Manufacturer, 'Shelly')
      .setCharacteristic(this.Characteristic.Model, this.device.modelName)
      .setCharacteristic(this.Characteristic.SerialNumber, serialNumber);
  }

  protected setupEventHandlers() {
    // no event handlers
  }

  detach() {
    // no event handlers
  }
}
