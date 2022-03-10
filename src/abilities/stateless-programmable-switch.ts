import { Input } from 'shellies-ng';

import { Ability, ServiceClass } from './base';

enum ButtonPress {
  Single = 'single',
  Double = 'double',
  Long = 'long',
}

export class StatelessProgrammableSwitchAbility extends Ability {
  /**
   * @param component - The input component to control.
   */
  constructor(readonly component: Input) {
    super(
      `Button ${component.id + 1}`,
      `stateless-programmable-switch-${component.id}`,
    );
  }

  protected get serviceClass(): ServiceClass {
    return this.Service.StatelessProgrammableSwitch;
  }

  protected initialize() {
    // set the index number for this switch
    this.service.setCharacteristic(
      this.Characteristic.ServiceLabelIndex,
      this.component.id + 1,
    );

    // listen for button press events
    this.component
      .on('singlePush', this.singlePushHandler, this)
      .on('doublePush', this.doublePushHandler, this)
      .on('longPush', this.longPushHandler, this);
  }

  detach() {
    this.component
      .off('singlePush', this.singlePushHandler, this)
      .off('doublePush', this.doublePushHandler, this)
      .off('longPush', this.longPushHandler, this);
  }

  /**
   * Triggers a button press event.
   * @param type - The type of button press to trigger.
   */
  protected triggerPress(type: ButtonPress) {
    this.log.debug(`Input ${this.component.id}: ${type} press`);

    const PSE = this.Characteristic.ProgrammableSwitchEvent;
    let value: number;

    // get the corresponding characteristic value
    switch (type) {
      case ButtonPress.Single:
        value = PSE.SINGLE_PRESS;
        break;

      case ButtonPress.Double:
        value = PSE.DOUBLE_PRESS;
        break;

      case ButtonPress.Long:
        value = PSE.LONG_PRESS;
        break;
    }

    // update the characteristic
    this.service.getCharacteristic(this.Characteristic.ProgrammableSwitchEvent)
      .updateValue(value);
  }

  /**
   * Handles 'singlePush' events from our input component.
   */
  protected singlePushHandler() {
    this.triggerPress(ButtonPress.Single);
  }

  /**
   * Handles 'doublePush' events from our input component.
   */
  protected doublePushHandler() {
    this.triggerPress(ButtonPress.Double);
  }

  /**
   * Handles 'longPush' events from our input component.
   */
  protected longPushHandler() {
    this.triggerPress(ButtonPress.Long);
  }
}
