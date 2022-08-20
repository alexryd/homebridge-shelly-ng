import { CharacteristicValue } from 'homebridge';
import { CharacteristicValue as ShelliesCharacteristicValue, Switch } from 'shellies-ng';

import { Ability, ServiceClass } from './base';

export class OutletAbility extends Ability {
  /**
   * @param component - The switch component to control.
   */
  constructor(readonly component: Switch) {
    super(
      `Outlet ${component.id + 1}`,
      `outlet-${component.id}`,
    );
  }

  protected get serviceClass(): ServiceClass {
    return this.Service.Outlet;
  }

  protected initialize() {
    // set the initial values
    this.service
      .setCharacteristic(
        this.Characteristic.On,
        this.component.output,
      ).setCharacteristic(
        this.Characteristic.OutletInUse,
        this.component.apower !== undefined && this.component.apower !== 0,
      );

    // listen for commands from HomeKit
    this.service.getCharacteristic(this.Characteristic.On)
      .onSet(this.onSetHandler.bind(this));

    // listen for updates from the device
    this.component
      .on('change:output', this.outputChangeHandler, this)
      .on('change:apower', this.apowerChangeHandler, this);
  }

  detach() {
    this.component
      .off('change:output', this.outputChangeHandler, this)
      .off('change:apower', this.apowerChangeHandler, this);
  }

  /**
   * Handles changes to the Outlet.On characteristic.
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

  /**
   * Handles changes to the `apower` property.
   */
  protected apowerChangeHandler(value: ShelliesCharacteristicValue) {
    this.service.getCharacteristic(this.Characteristic.OutletInUse)
      .updateValue(value as number);
  }
}
