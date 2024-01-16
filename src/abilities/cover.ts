import { CharacteristicValue } from 'homebridge';
import { Cover } from 'shellies-ng';

import { Ability, ServiceClass } from './base';

const names = {
  'door': 'Door',
  'window': 'Window',
  'windowCovering': 'Window Covering',
};

export class CoverAbility extends Ability {
  /**
   * @param component - The cover component to control.
   * @param type - The type of cover.
   */
  constructor(readonly component: Cover, readonly type: 'door' | 'window' | 'windowCovering' = 'window') {
    super(
      `${names[type]} ${component.id + 1}`,
      `${type}-${component.id}`,
    );
  }

  protected get serviceClass(): ServiceClass {
    if (this.type === 'door') {
      return this.Service.Door;
    } else if (this.type === 'windowCovering') {
      return this.Service.WindowCovering;
    }
    return this.Service.Window;
  }

  /**
   * The current state of the cover.
   */
  protected get positionState(): CharacteristicValue {
    if (this.component.state === 'opening') {
      return this.Characteristic.PositionState.INCREASING;
    } else if (this.component.state === 'closing') {
      return this.Characteristic.PositionState.DECREASING;
    }

    return this.Characteristic.PositionState.STOPPED;
  }

  /**
   * The current position of the cover.
   */
  protected get currentPosition(): CharacteristicValue {
    return this.component.current_pos ?? 0;
  }

  /**
   * The target position that the cover is moving towards.
   */
  protected get targetPosition(): CharacteristicValue {
    return this.component.target_pos ?? this.currentPosition;
  }

  protected initialize() {
    // abort if this cover hasn't been calibrated
    if (!this.component.pos_control) {
      this.log.warn('Only calibrated covers are supported.');
      return;
    }

    // set the initial values
    this.service
      .setCharacteristic(this.Characteristic.PositionState, this.positionState)
      .setCharacteristic(this.Characteristic.CurrentPosition, this.currentPosition)
      .setCharacteristic(this.Characteristic.TargetPosition, this.targetPosition);

    // listen for commands from HomeKit
    this.service.getCharacteristic(this.Characteristic.TargetPosition)
      .onSet(this.targetPositionSetHandler.bind(this));

    // listen for updates from the device
    this.component
      .on('change:state', this.stateChangeHandler, this)
      .on('change:current_pos', this.currentPosChangeHandler, this)
      .on('change:target_pos', this.targetPosChangeHandler, this);
  }

  detach() {
    this.component
      .off('change:state', this.stateChangeHandler, this)
      .off('change:current_pos', this.currentPosChangeHandler, this)
      .off('change:target_pos', this.targetPosChangeHandler, this);
  }

  /**
   * Handles changes to the TargetPosition characteristic.
   */
  protected async targetPositionSetHandler(value: CharacteristicValue) {
    if (value === this.component.target_pos) {
      return;
    }

    try {
      await this.component.goToPosition(value as number);
    } catch (e) {
      this.log.error(
        'Failed to set target position:',
        e instanceof Error ? e.message : e,
      );
      throw this.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE;
    }
  }

  /**
   * Handles changes to the `state` property.
   */
  protected stateChangeHandler() {
    this.log.debug(`${this.component.id} state changed to ${this.positionState}`, {
      target: this.targetPosition,
      current: this.currentPosition,
    })
    this.updateStates();
  }

  // We need to update all states when any of them change, otherwise HomeKit
  // gets confused and thinks the cover is in a different state than it actually
  // is. Shelly does not send all attributes in any single update, so we need
  // to update all of them when any of them change.
  protected updateStates() {
    this.service.getCharacteristic(this.Characteristic.PositionState)
    .updateValue(this.positionState);
    this.service.getCharacteristic(this.Characteristic.TargetPosition)
        .updateValue(this.targetPosition);
    this.service.getCharacteristic(this.Characteristic.CurrentPosition)
        .updateValue(this.currentPosition);
  }

  /**
   * Handles changes to the `current_pos` property.
   */
  protected currentPosChangeHandler() {
    this.log.debug(`${this.component.id} position changed to ${this.currentPosition}`, {
      target: this.targetPosition,
      state: this.positionState,
    })
    this.updateStates();
  }

  /**
   * Handles changes to the `target_pos` property.
   */
  protected targetPosChangeHandler() {
    this.log.debug(`${this.component.id} target position changed to ${this.targetPosition}`, {
      state: this.positionState,
      current: this.currentPosition,
    })
    this.updateStates();
  }

}
