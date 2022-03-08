import { Device } from 'shellies-ng';

import { Ability, ServiceClass } from './base';

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

  protected get serviceClass(): ServiceClass {
    return this.Service.AccessoryInformation;
  }

  protected initialize() {
    this.service
      .setCharacteristic(this.Characteristic.Name, this.platformAccessory.displayName)
      .setCharacteristic(this.Characteristic.Manufacturer, 'Allterco')
      .setCharacteristic(this.Characteristic.Model, this.device.modelName)
      .setCharacteristic(this.Characteristic.SerialNumber, this.device.macAddress)
      .setCharacteristic(this.Characteristic.FirmwareRevision, this.device.firmware.version || '1.0.0');
  }

  detach() {
    // no event handlers
  }
}
