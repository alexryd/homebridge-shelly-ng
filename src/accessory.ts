import { DeviceId } from 'shellies-ng';
import { PlatformAccessory } from 'homebridge';

import { Ability } from './abilities';
import { DeviceLogger } from './utils/device-logger';
import { ShellyPlatform } from './platform';

export type AccessoryId = string;
export type AccessoryUuid = string;

/**
 * Represents a HomeKit accessory.
 */
export class Accessory {
  /**
   * The UUID used to identify this accessory with HomeKit.
   */
  readonly uuid: AccessoryUuid;

  protected _platformAccessory: PlatformAccessory | null;

  /**
   * The underlying homebridge platform accessory.
   * This property will be `null` when the accessory is inactive.
   */
  get platformAccessory(): PlatformAccessory | null {
    return this._platformAccessory;
  }

  /**
   * Holds this accessory's abilities.
   */
  readonly abilities: Ability[];

  private _active = true;

  /**
   * Whether this accessory is active.
   * Setting an accessory to inactive will remove it from HoneKit.
   */
  get active(): boolean {
    return this._active;
  }

  set active(value) {
    if (value === this._active) {
      return;
    }

    this._active = value;
    this.update();
  }

  /**
   * Timeout used to delay calls to `update()`.
   */
  protected updateTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * @param id - The accessory ID.
   * @param deviceId - The associated device ID.
   * @param name - A user-friendly name of the accessory.
   * @param platform - A reference to the homebridge platform.
   * @param log - The logger to use.
   * @param abilities - The abilities that this accessory has.
   */
  constructor(
    readonly id: AccessoryId,
    readonly deviceId: DeviceId,
    readonly name: string,
    readonly platform: ShellyPlatform,
    readonly log: DeviceLogger,
    ...abilities: Ability[]) {
    this.uuid = platform.api.hap.uuid.generate(`${deviceId}-${id}`);
    this.abilities = abilities;

    // try to load the platform accessory from cache
    this._platformAccessory = platform.getAccessory(this.uuid) || null;
    if (this._platformAccessory !== null) {
      log.debug(`Accessory loaded from cache (ID: ${id})`);
    }

    this.update();
  }

  /**
   * Sets `active` to the given value.
   * This method can be used when chaining calls, as it returns a reference to `this`.
   * @param value - Whether the accessory should be active.
   */
  setActive(value: boolean): this {
    this.active = value;
    return this;
  }

  /**
   * Updates this accessory based on whether it is active.
   */
  protected update() {
    // clear any running timeout
    if (this.updateTimeout !== null) {
      clearTimeout(this.updateTimeout);
    }

    // call either activate() or deactivate() depending on whether the accessory is active
    // these calls are made after a short timeout to avoid unnecessary activations when an
    // accessory is deactivated immediately after construction
    this.updateTimeout = setTimeout(() => {
      this.updateTimeout = null;

      if (this.active) {
        this.activate();
      } else {
        this.deactivate();
      }
    }, 0);
  }

  /**
   * Activates this accessory, by creating a platform accessory and setting up all abilities.
   */
  protected activate() {
    if (this._platformAccessory === null) {
      // create a new platform accessory
      this._platformAccessory = this.createPlatformAccessory();

      this.log.debug(`Accessory activated (ID: ${this.id})`);
    }

    // setup all abilities
    for (const a of this.abilities) {
      try {
        a.setup(this._platformAccessory, this.platform, this.log);
      } catch (e) {
        this.log.error('Failed to setup ability:', e instanceof Error ? e.message : e);
        this.log.debug('Accessory ID:', this.id);
        if (e instanceof Error && e.stack) {
          this.log.debug(e.stack);
        }
      }
    }

    // register the platform accessory
    this.platform.addAccessory(this._platformAccessory);
  }

  /**
   * Deactivates this accessory, by destroying all abilities and the platform accessory.
   */
  protected deactivate() {
    // destroy all abilities
    for (const a of this.abilities) {
      try {
        a.destroy();
      } catch (e) {
        this.log.error('Failed to destroy ability:', e instanceof Error ? e.message : e);
        this.log.debug('Accessory ID:', this.id);
        if (e instanceof Error && e.stack) {
          this.log.debug(e.stack);
        }
      }
    }

    if (this._platformAccessory !== null) {
      // unregister the platform accessory
      this.platform.removeAccessory(this._platformAccessory);
      this._platformAccessory = null;

      this.log.debug(`Accessory deactivated (ID: ${this.id})`);
    }
  }

  /**
   * Creates a new platform accessory for this accessory.
   */
  protected createPlatformAccessory(): PlatformAccessory {
    // create a new accessory
    const pa = new this.platform.api.platformAccessory(
      this.name,
      this.uuid,
    );

    // store info in the context
    pa.context.device = {
      id: this.deviceId,
    };

    return pa;
  }

  /**
   * Removes all event listeners from this accessory.
   */
  detach() {
    // abort any pending update
    if (this.updateTimeout !== null) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }

    // invoke detach() on all abilities
    for (const a of this.abilities) {
      try {
        a.detach();
      } catch (e) {
        this.log.error('Failed to detach ability:', e instanceof Error ? e.message : e);
        this.log.debug('Accessory ID:', this.id);
        if (e instanceof Error && e.stack) {
          this.log.debug(e.stack);
        }
      }
    }
  }
}
