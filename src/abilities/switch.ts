import { CharacteristicValue, Service } from 'homebridge';
import { CharacteristicValue as ShelliesCharacteristicValue, Switch } from 'shellies-ng';

import { Ability } from './base';

export class SwitchAbility extends Ability {
  /**
   * @param component - The switch component to control.
   */
  constructor(readonly component: Switch) {
    super();
  }

  protected setupService(): Service {
    // create the service
    const service = this.getOrAddService(
      this.Service.Switch,
      `Switch ${this.component.id + 1}`,
      `switch-${this.component.id}`,
    );

    // set the initial value
    service.setCharacteristic(
      this.Characteristic.On,
      this.component.output,
    );

    return service;
  }

  protected setupEventHandlers() {
    // listen for commands from HomeKit
    this.service.getCharacteristic(this.Characteristic.On)
      .onSet(this.onSetHandler.bind(this));

    // listen for updates from the device
    this.component.on('change', this.propertyChangeHandler, this);
  }

  detach() {
    this.component.off('change', this.propertyChangeHandler, this);
  }

  /**
   * Handles changes to the Switch.On characteristic.
   */
  protected async onSetHandler(value: CharacteristicValue) {
    if (value === this.component.output) {
      return;
    }

    await this.component.set(value as boolean);
  }

  /**
   * Handles changes to the `output` property.
   */
  protected propertyChangeHandler(property: string, value: ShelliesCharacteristicValue) {
    if (property === 'output') {
      this.service.getCharacteristic(this.Characteristic.On)
        .updateValue(value as boolean);
    }
  }
}
