import {
  API,
  Characteristic,
  PlatformAccessory,
  Service,
  WithUUID,
} from 'homebridge';

import { DeviceHandler } from '../device-handlers';
import { DeviceLogger } from '../utils/device-logger';

/**
 * Base class for all abilities.
 * An ability is roughly equivalent to a HomeKit service.
 */
export abstract class Ability {
  private _platformAccessory: PlatformAccessory | null = null;

  /**
   * The associated platform accessory.
   */
  get platformAccessory(): PlatformAccessory {
    if (this._platformAccessory === null) {
      throw new Error('Ability has not yet been setup');
    }
    return this._platformAccessory;
  }

  private _api: API | null = null;

  /**
   * A reference to the homebridge API.
   */
  protected get api(): API {
    if (this._api === null) {
      throw new Error('Ability has not yet been setup');
    }
    return this._api;
  }

  /**
   * Shorthand property.
   */
  protected get Service(): typeof Service {
    return this.api.hap.Service;
  }

  /**
   * Shorthand property.
   */
  protected get Characteristic(): typeof Characteristic {
    return this.api.hap.Characteristic;
  }

  private _log: DeviceLogger | null = null;

  /**
   * The logging device to use.
   */
  protected get log(): DeviceLogger {
    if (this._log === null) {
      throw new Error('Ability has not yet been setup');
    }
    return this._log;
  }

  private _service: Service | null = null;

  /**
   * The HomeKit service that this ability uses.
   */
  protected get service(): Service {
    if (this._service === null) {
      throw new Error('Ability has not yet been setup');
    }
    return this._service;
  }

  /**
   * Sets up this ability.
   * This method must be called to initialize the ability.
   * @param deviceHandler - The device handler that created this ability.
   * @param platformAccessory - The homebridge platform accessory to use.
   */
  setup(deviceHandler: DeviceHandler, platformAccessory: PlatformAccessory) {
    this._api = deviceHandler.platform.api;
    this._log = deviceHandler.log;
    this._platformAccessory = platformAccessory;

    this._service = this.setupService();
    this.setupEventHandlers();
  }

  /**
   * Subclasses should use this method to setup their services and set default values for their
   * characteristics.
   */
  protected abstract setupService(): Service;

  /**
   * Returns a service of the given class.
   * Use `name` and `subtype` to differentiate between multiple services of the same class.
   * If the platform accessory has a matching service, it will be returned. Otherwise, the service will be added.
   * @param cls - A service class.
   * @param name - A name of the service.
   * @param subtype - A unique identifier for this service.
   */
  protected getOrAddService(cls: WithUUID<typeof Service>, name?: string, subtype?: string): Service {
    if (name && subtype) {
      return this.platformAccessory.getService(name) || this.platformAccessory.addService(cls, name, subtype);
    }
    return this.platformAccessory.getService(cls) || this.platformAccessory.addService(cls);
  }

  /**
   * Subclasses should use this method to attach event listeners to the device and possibly also the
   * platform accessory.
   */
  protected abstract setupEventHandlers();

  /**
   * Subclasses should use this method to remove all event listeners.
   */
  abstract detach();
}
