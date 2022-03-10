import { Perms } from 'homebridge';
import { CharacteristicValue as ShelliesCharacteristicValue, Input } from 'shellies-ng';

import { Ability, ServiceClass } from './base';

/**
 * This ability creates a switch that can't be controlled from HomeKit, it only reflects
 * the device's input state.
 */
export class ReadonlySwitchAbility extends Ability {
  /**
   * @param component - The input component to represent.
   */
  constructor(readonly component: Input) {
    super(
      `Switch ${component.id + 1}`,
      `readonly-switch-${component.id}`,
    );
  }

  protected get serviceClass(): ServiceClass {
    return this.Service.Switch;
  }

  protected initialize() {
    this.service.getCharacteristic(this.Characteristic.On)
      // remove the write permissions
      .setProps({
        perms: [Perms.NOTIFY, Perms.PAIRED_READ],
      })
      // set the initial value
      .setValue(this.component.state ?? false);

    // listen for updates from the device
    this.component.on('change:state', this.stateChangeHandler, this);
  }

  detach() {
    this.component.off('change:state', this.stateChangeHandler, this);
  }

  /**
   * Handles changes to the `state` property.
   */
  protected stateChangeHandler(value: ShelliesCharacteristicValue) {
    const v: boolean = value === null ? false : value as boolean;

    this.service.getCharacteristic(this.Characteristic.On)
      .updateValue(v);
  }
}
