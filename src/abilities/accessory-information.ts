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
    return this.getOrAddService(this.Service.AccessoryInformation)
      .setCharacteristic(this.Characteristic.Manufacturer, 'Allterco')
      .setCharacteristic(this.Characteristic.Model, this.device.modelName)
      .setCharacteristic(this.Characteristic.SerialNumber, this.device.macAddress);
  }

  protected setupEventHandlers() {
    // no event handlers
  }

  detach() {
    // no event handlers
  }
}
