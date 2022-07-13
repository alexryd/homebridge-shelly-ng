import {
  API,
  Characteristic,
  PlatformAccessory,
  Service,
  WithUUID,
} from 'homebridge';

import { CustomCharacteristics } from '../utils/characteristics';
import { CustomServices } from '../utils/services';
import { DeviceLogger } from '../utils/device-logger';
import { ShellyPlatform } from '../platform';

export type ServiceClass = WithUUID<typeof Service>;

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

  private _platform: ShellyPlatform | null = null;

  /**
   * A reference to the platform.
   */
  protected get platform(): ShellyPlatform {
    if (this._platform === null) {
      throw new Error('Ability has not yet been setup');
    }
    return this._platform;
  }

  /**
   * A reference to the homebridge API.
   */
  protected get api(): API {
    return this.platform.api;
  }

  /**
   * Shorthand property.
   */
  protected get Characteristic(): typeof Characteristic {
    return this.platform.api.hap.Characteristic;
  }

  /**
   * Shorthand property.
   */
  protected get Service(): typeof Service {
    return this.platform.api.hap.Service;
  }

  /**
   * Shorthand property.
   */
  protected get customCharacteristics(): CustomCharacteristics {
    return this.platform.customCharacteristics;
  }

  /**
   * Shorthand property.
   */
  protected get customServices(): CustomServices {
    return this.platform.customServices;
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

  private _active = true;

  /**
   * Whether this ability is active.
   * Setting an ability to inactive will remove its HomeKit service.
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
   * @param serviceName - A name of the service.
   * @param serviceSubtype - A unique identifier for the service.
   */
  constructor(
    protected readonly serviceName?: string,
    protected readonly serviceSubtype?: string,
  ) {}

  /**
   * Sets up this ability.
   * This method is called by the parent accessory every time it becomes active.
   * @param platformAccessory - The homebridge platform accessory to use.
   * @param platform - A reference to the platform.
   * @param log - The logger to use.
   */
  setup(platformAccessory: PlatformAccessory, platform: ShellyPlatform, log: DeviceLogger) {
    this._platformAccessory = platformAccessory;
    this._platform = platform;
    this._log = log;

    this.update();
  }

  /**
   * Sets `active` to the given value.
   * This method can be used when chaining calls, as it returns a reference to `this`.
   * @param value - Whether the ability should be active.
   */
  setActive(value: boolean): this {
    this.active = value;
    return this;
  }

  /**
   * Determines whether this ability is active.
   * The default implementation simply returns the value of the `active` property.
   * Subclasses can override this method to add more conditions.
   */
  protected isActive(): boolean {
    return this.active;
  }

  /**
   * Updates this ability based on whether it is active.
   * If active, its service will be added and initialized.
   * If inactive, its service will be removed.
   */
  protected update() {
    if (this._platformAccessory === null) {
      // abort if setup() hasn't been called yet
      return;
    }

    if (this.isActive()) {
      // we're active, add and initialize our service
      if (this._service === null) {
        this._service = this.addService();
        this.initialize();
      }
    } else {
      // we're inactive, detach from and remove our service
      if (this._service !== null) {
        this.detach();
      }

      this.removeService();
      this._service = null;
    }
  }

  /**
   * Returns a service for this ability.
   * If the platform accessory has a matching service, it will be returned. Otherwise, the service will be added.
   */
  protected addService(): Service {
    if (this.serviceName && this.serviceSubtype) {
      return this.platformAccessory.getService(this.serviceName)
        || this.platformAccessory.addService(this.serviceClass, this.serviceName, this.serviceSubtype);
    }

    return this.platformAccessory.getService(this.serviceClass)
      || this.platformAccessory.addService(this.serviceClass);
  }

  /**
   * Removes this ability's service from the platform accessory.
   */
  protected removeService() {
    let service: Service | undefined;

    // since the platform accessory may have been loaded from cache with a service created previously,
    // we can't just rely on the _service property here
    if (this._service !== null) {
      service = this._service;
    } else if (this.serviceName && this.serviceSubtype) {
      service = this.platformAccessory.getService(this.serviceName);
    } else {
      service = this.platformAccessory.getService(this.serviceClass);
    }

    if (service) {
      this.platformAccessory.removeService(service);
    }
  }

  /**
   * Helper method that removes a characteristic based on its class (Service.removeCharacteristic()
   * only accepts an instance).
   * @param characteristic - The characteristic to remove.
   */
  protected removeCharacteristic(characteristic: WithUUID<new () => Characteristic> & WithUUID<typeof Characteristic>) {
    const s = this.service;

    // getCharacteristic() will add the characteristic if it doesn't exist, so we need to use testCharacteristic() to avoid
    // adding and then immediately removing it
    if (s.testCharacteristic(characteristic)) {
      s.removeCharacteristic(s.getCharacteristic(characteristic));
    }
  }

  /**
   * Subclasses should implement this method to return the HomeKit service type to use.
   */
  protected abstract get serviceClass(): ServiceClass;

  /**
   * Subclasses should use this method to initialize the service and attach their event listeners.
   */
  protected abstract initialize();

  /**
   * Subclasses should use this method to remove their event listeners.
   */
  abstract detach();

  /**
   * Removes all event listeners and all references to the platform accessory.
   * This method is called by the parent accessory every time it becomes inactive.
   * Note that this method doesn't remove the service from the platform accessory as it is assumed that
   * the entire platform accessory is about to be unregistered and discarded.
   */
  destroy() {
    this.detach();

    this._platformAccessory = null;
    this._platform = null;
    this._log = null;
    this._service = null;
  }
}
