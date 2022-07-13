import { API, Service, WithUUID } from 'homebridge';

import { CustomCharacteristics } from './characteristics';

type S = WithUUID<typeof Service>;

export interface CustomServices {
  PowerMeter: S;
}

/**
 * Returns a set of custom HomeKit services.
 * @param api - A reference to the homebridge API.
 * @param characteristics - Custom characteristics used with these services.
 */
export const createServices = (api: API, characteristics: CustomCharacteristics): CustomServices => {
  /**
   * Reports power meter readings.
   */
  class PowerMeter extends api.hap.Service {
    static readonly UUID = 'DEDBEA44-11ED-429C-BD75-9A2286AA8707';

    constructor(displayName?: string, subtype?: string) {
      super(displayName, PowerMeter.UUID, subtype);

      this.addCharacteristic(characteristics.CurrentConsumption);

      this.addOptionalCharacteristic(characteristics.TotalConsumption);
      this.addOptionalCharacteristic(characteristics.ElectricCurrent);
      this.addOptionalCharacteristic(characteristics.Voltage);
    }
  }

  return {
    PowerMeter,
  };
};
