import { Ability, ServiceClass } from './base';

export class ServiceLabelAbility extends Ability {
  /**
   * @param namespace - The naming schema for the accessory.
   */
  constructor(readonly namespace: 'dots' | 'arabicNumerals' = 'arabicNumerals') {
    super();
  }

  protected get serviceClass(): ServiceClass {
    return this.Service.ServiceLabel;
  }

  protected initialize() {
    const SLN = this.Characteristic.ServiceLabelNamespace;

    // set the namespace
    this.service.setCharacteristic(
      SLN,
      this.namespace === 'dots' ? SLN.DOTS : SLN.ARABIC_NUMERALS,
    );
  }

  detach() {
    // nothing to detach
  }
}
