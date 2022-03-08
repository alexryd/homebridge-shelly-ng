import { CharacteristicValue } from 'homebridge';
import { CharacteristicValue as ShelliesCharacteristicValue, Switch } from 'shellies-ng';

import { Ability, ServiceClass } from './base';

export class SwitchAbility extends Ability {
  /**
   * @param component - The switch component to control.
   */
  constructor(readonly component: Switch) {
    super(
      `Switch ${component.id + 1}`,
      `switch-${component.id}`,
    );
  }

  protected get serviceClass(): ServiceClass {
    return this.Service.Switch;
  }

  protected initialize() {
    // set the initial value
    this.service.setCharacteristic(
      this.Characteristic.On,
      this.component.output,
    );

    // listen for commands from HomeKit
    this.service.getCharacteristic(this.Characteristic.On)
      .onSet(this.onSetHandler.bind(this));

    // listen for updates from the device
    this.component.on('change:output', this.outputChangeHandler, this);
  }

  detach() {
    this.component.off('change:output', this.outputChangeHandler, this);
  }

  /**
   * Handles changes to the Switch.On characteristic.
   */
  protected async onSetHandler(value: CharacteristicValue) {
    if (value === this.component.output) {
      return;
    }

    try {
      await this.component.set(value as boolean);
    } catch (e) {
      this.log.error(
        'Failed to set switch:',
        e instanceof Error ? e.message : e,
      );
      throw this.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE;
    }
  }

  /**
   * Handles changes to the `output` property.
   */
  protected outputChangeHandler(value: ShelliesCharacteristicValue) {
    this.service.getCharacteristic(this.Characteristic.On)
      .updateValue(value as boolean);
  }
}
