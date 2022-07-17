import { API, Characteristic, WithUUID } from 'homebridge';

type C = WithUUID<new () => Characteristic> & WithUUID<typeof Characteristic>;

export interface CustomCharacteristics {
  CurrentConsumption: C;
  ElectricCurrent: C;
  TotalConsumption: C;
  Voltage: C;
}

/**
 * Returns a set of custom HomeKit characteristics.
 * @param api - A reference to the homebridge API.
 */
export const createCharacteristics = (api: API): CustomCharacteristics => {
  /**
   * Current energy consumption, in watts.
   */
  class CurrentConsumption extends api.hap.Characteristic {
    static readonly UUID = 'E863F10D-079E-48FF-8F27-9C2605A29F52';

    constructor() {
      super('Current Consumption', CurrentConsumption.UUID, {
        format: api.hap.Formats.FLOAT,
        perms: [api.hap.Perms.NOTIFY, api.hap.Perms.READ],
        unit: 'W',
        minValue: 0,
        maxValue: 12000,
        minStep: 0.1,
      });
    }
  }

  /**
   * Current measured electric current, in amperes.
   */
  class ElectricCurrent extends api.hap.Characteristic {
    static readonly UUID = 'E863F126-079E-48FF-8F27-9C2605A29F52';

    constructor() {
      super('Electric Current', ElectricCurrent.UUID, {
        format: api.hap.Formats.FLOAT,
        perms: [api.hap.Perms.NOTIFY, api.hap.Perms.READ],
        unit: 'A',
        minValue: 0,
        maxValue: 48,
        minStep: 0.1,
      });
    }
  }

  /**
   * Total energy consumption, in kilowatt hours.
   */
  class TotalConsumption extends api.hap.Characteristic {
    static readonly UUID = 'E863F10C-079E-48FF-8F27-9C2605A29F52';

    constructor() {
      super('Total Consumption', TotalConsumption.UUID, {
        format: api.hap.Formats.FLOAT,
        perms: [api.hap.Perms.NOTIFY, api.hap.Perms.READ],
        unit: 'kWh',
        minValue: 0,
        maxValue: 1000000,
        minStep: 0.1,
      });
    }
  }

  /**
   * Current measured voltage, in volts.
   */
  class Voltage extends api.hap.Characteristic {
    static readonly UUID = 'E863F10A-079E-48FF-8F27-9C2605A29F52';

    constructor() {
      super('Voltage', Voltage.UUID, {
        format: api.hap.Formats.FLOAT,
        perms: [api.hap.Perms.NOTIFY, api.hap.Perms.READ],
        unit: 'V',
        minValue: -1000,
        maxValue: 1000,
        minStep: 0.1,
      });
    }
  }

  return {
    CurrentConsumption,
    ElectricCurrent,
    TotalConsumption,
    Voltage,
  };
};
