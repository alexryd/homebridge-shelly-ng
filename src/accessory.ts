import { PlatformAccessory } from 'homebridge';

import { Ability } from './abilities';

/**
 * Represents a HomeKit accessory.
 */
export class ShellyAccessory {
  /**
   * Holds this accessory's abilities.
   */
  readonly abilities: Ability[];

  /**
   * @param platformAccessory - The underlying homebridge platform accessory.
   * @param abilities - The abilities that this accessory has.
   */
  constructor(readonly platformAccessory: PlatformAccessory, ...abilities: Ability[]) {
    this.abilities = abilities;
  }

  /**
   * Removes all event listeners from this accessory.
   */
  detach() {
    // invoke detach() on all abilities
    for (const a of this.abilities) {
      a.detach();
    }
  }
}
