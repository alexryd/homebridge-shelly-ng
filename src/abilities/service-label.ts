import { Service } from 'homebridge';

import { Ability } from './base';

export class ServiceLabelAbility extends Ability {
  /**
   * @param namespace - The naming schema for the accessory.
   */
  constructor(readonly namespace: 'dots' | 'arabicNumerals' = 'arabicNumerals') {
    super();
  }

  protected setupService(): Service {
    const SLN = this.Characteristic.ServiceLabelNamespace;

    // create the service
    const service = this.getOrAddService(this.Service.ServiceLabel);

    // set the namespace
    service.setCharacteristic(
      SLN,
      this.namespace === 'dots' ? SLN.DOTS : SLN.ARABIC_NUMERALS,
    );

    return service;
  }

  protected setupEventHandlers() {
    // nothing to setup
  }

  detach() {
    // nothing to detach
  }
}
