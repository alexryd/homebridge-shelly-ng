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
  protected get positionState(): number {
    const state = this.component.state;

    if (state === 'opening') {
      return this.Characteristic.PositionState.INCREASING;
    } else if (state === 'closing') {
      return this.Characteristic.PositionState.DECREASING;
    }

    return this.Characteristic.PositionState.STOPPED;
  }

  /**
   * The current position of the cover.
   */
  protected get currentPosition(): number {
    return this.component.current_pos ?? 0;
  }

  /**
   * The target position that the cover is moving towards.
   */
  protected get targetPosition(): number {
    return this.component.target_pos ?? this.currentPosition;
  }

  protected initialize() {
    // abort if this cover hasn't been calibrated
    if (this.component.pos_control !== true) {
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
    this.service.getCharacteristic(this.Characteristic.PositionState)
      .updateValue(this.positionState);
  }

  /**
   * Handles changes to the `current_pos` property.
   */
  protected currentPosChangeHandler() {
    this.service.getCharacteristic(this.Characteristic.CurrentPosition)
      .updateValue(this.currentPosition);
  }

  /**
   * Handles changes to the `target_pos` property.
   */
  protected targetPosChangeHandler() {
    this.service.getCharacteristic(this.Characteristic.TargetPosition)
      .updateValue(this.targetPosition);
  }
}
