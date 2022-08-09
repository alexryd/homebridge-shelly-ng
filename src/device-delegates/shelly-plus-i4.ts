import { ShellyPlusI4 } from 'shellies-ng';

import { DeviceDelegate } from './base';
import {
  ReadonlySwitchAbility,
  ServiceLabelAbility,
  StatelessProgrammableSwitchAbility,
} from '../abilities';

/**
 * Handles Shelly Plus I4 devices.
 */
export class ShellyPlusI4Delegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPlusI4;

    // determine each input type
    const input0IsButton = d.input0.config?.type === 'button';
    const input1IsButton = d.input1.config?.type === 'button';
    const input2IsButton = d.input2.config?.type === 'button';
    const input3IsButton = d.input3.config?.type === 'button';

    // create an accessory for all button inputs
    this.createAccessory(
      'buttons',
      null,
      new StatelessProgrammableSwitchAbility(d.input0).setActive(input0IsButton),
      new StatelessProgrammableSwitchAbility(d.input1).setActive(input1IsButton),
      new StatelessProgrammableSwitchAbility(d.input2).setActive(input2IsButton),
      new StatelessProgrammableSwitchAbility(d.input3).setActive(input3IsButton),
      new ServiceLabelAbility(),
    ).setActive(input0IsButton || input1IsButton || input2IsButton || input3IsButton);

    // create accessories for all switch inputs
    this.createAccessory('switch0', null, new ReadonlySwitchAbility(d.input0)).setActive(!input0IsButton);
    this.createAccessory('switch1', null, new ReadonlySwitchAbility(d.input1)).setActive(!input1IsButton);
    this.createAccessory('switch2', null, new ReadonlySwitchAbility(d.input2)).setActive(!input2IsButton);
    this.createAccessory('switch3', null, new ReadonlySwitchAbility(d.input3)).setActive(!input3IsButton);
  }
}

DeviceDelegate.registerDelegate(ShellyPlusI4Delegate, ShellyPlusI4);
