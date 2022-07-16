import {
  CharacteristicValue as ShelliesCharacteristicValue,
  Cover,
  Switch,
  SwitchEnergyCounterAttributes,
} from 'shellies-ng';

import { Ability, ServiceClass } from './base';

/**
* This ability sets up a custom service that reports power meter readings.
 */
export class PowerMeterAbility extends Ability {
  /**
   * @param component - The switch or cover component to get readings from.
   */
  constructor(readonly component: Switch | Cover) {
    super(
      `Power Meter ${component.id + 1}`,
      `power-meter-${component.id}`,
    );
  }

  protected get serviceClass(): ServiceClass {
    return this.customServices.PowerMeter;
  }

  protected initialize() {
    const s = this.service;
    const c = this.component;
    const cc = this.customCharacteristics;

    // setup Current Consumption
    s.setCharacteristic(
      cc.CurrentConsumption,
      c.apower ?? 0,
    );

    c.on('change:apower', this.apowerChangeHandler, this);

    // setup Voltage
    if (c.voltage !== undefined) {
      s.setCharacteristic(
        cc.Voltage,
        c.voltage,
      );

      c.on('change:voltage', this.voltageChangeHandler, this);
    } else {
      this.removeCharacteristic(cc.Voltage);
    }

    // setup Electric Current
    if (c.current !== undefined) {
      s.setCharacteristic(
        cc.ElectricCurrent,
        c.current,
      );

      c.on('change:current', this.currentChangeHandler, this);
    } else {
      this.removeCharacteristic(cc.ElectricCurrent);
    }

    // setup Total Consumption
    if (c.aenergy !== undefined) {
      s.setCharacteristic(
        cc.TotalConsumption,
        c.aenergy.total / 1000,
      );

      c.on('change:aenergy', this.aenergyChangeHandler, this);
    } else {
      this.removeCharacteristic(cc.TotalConsumption);
    }
  }

  detach() {
    this.component
      .off('change:apower', this.apowerChangeHandler, this)
      .off('change:voltage', this.voltageChangeHandler, this)
      .off('change:current', this.currentChangeHandler, this)
      .off('change:aenergy', this.aenergyChangeHandler, this);
  }

  /**
   * Handles changes to the `apower` property.
   */
  protected apowerChangeHandler(value: ShelliesCharacteristicValue) {
    this.service.updateCharacteristic(
      this.customCharacteristics.CurrentConsumption,
      value as number,
    );
  }

  /**
   * Handles changes to the `voltage` property.
   */
  protected voltageChangeHandler(value: ShelliesCharacteristicValue) {
    this.service.updateCharacteristic(
      this.customCharacteristics.Voltage,
      value as number,
    );
  }

  /**
   * Handles changes to the `current` property.
   */
  protected currentChangeHandler(value: ShelliesCharacteristicValue) {
    this.service.updateCharacteristic(
      this.customCharacteristics.ElectricCurrent,
      value as number,
    );
  }

  /**
   * Handles changes to the `aenergy` property.
   */
  protected aenergyChangeHandler(value: ShelliesCharacteristicValue) {
    const attr = (value as unknown) as SwitchEnergyCounterAttributes;

    this.service.updateCharacteristic(
      this.customCharacteristics.TotalConsumption,
      attr.total / 1000,
    );
  }
}
