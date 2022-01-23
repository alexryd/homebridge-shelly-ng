import { Device } from 'shellies-ng';
import { PlatformAccessory } from 'homebridge';

import { Ability, AccessoryInformationAbility } from '../abilities';
import { DeviceLogger } from '../utils/device-logger';
import { DeviceOptions } from '../config';
import { PLATFORM_NAME, PLUGIN_NAME, ShellyPlatform } from '../platform';

type AccessoryId = string;

/**
 * Represents a HomeKit accessory.
 */
export class Accessory {
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

/**
 * Describes a device handler class.
 */
export interface DeviceHandlerClass {
  new (device: Device, options: DeviceOptions, platform: ShellyPlatform): DeviceHandler;
}

/**
 * A DeviceHandler manages accessories for a device.
 */
export abstract class DeviceHandler {
  /**
   * Holds all registered subclasses.
   */
  private static readonly subclasses: Map<string, DeviceHandlerClass> = new Map();

  /**
   * Registers a device handler, so that it can later be found based on its device model
   * using the `DeviceHandler.getClass()` method.
   * @param cls - A subclass of `DeviceHandler`.
   * @param model - The device's model designation.
   */
  static registerClass(cls: DeviceHandlerClass, model: string) {
    const mdl = model.toUpperCase();

    // make sure it's not already registered
    if (DeviceHandler.subclasses.has(mdl)) {
      throw new Error(`A device handler for ${model} has already been registered`);
    }

    // add it to the list
    DeviceHandler.subclasses.set(mdl, cls);
  }

  /**
   * Returns the device handler for the given device model, if one has been registered.
   * @param model - The model designation to lookup.
   */
  static getClass(model: string): DeviceHandlerClass | undefined {
    return DeviceHandler.subclasses.get(model.toUpperCase());
  }

  /**
   * Holds all accessories for this device.
   */
  protected readonly accessories: Map<AccessoryId, Accessory> = new Map();

  /**
   * Logger specific for this device.
   */
  readonly log: DeviceLogger;

  /**
   * @param device - The device to handle.
   * @param options - Configuration options for the device.
   * @param platform - A reference to the homebridge platform.
   */
  constructor(readonly device: Device, readonly options: DeviceOptions, readonly platform: ShellyPlatform) {
    this.log = new DeviceLogger(device, options.name, platform.log);
    this.log.info('Device added');

    this.log.debug(device.rpcHandler.connected ? 'Device is connected' : 'Device is disconnected');

    device
      .on('connect', this.handleConnect, this)
      .on('disconnect', this.handleDisconnect, this);

    this.setup();
  }

  /**
   * Subclasses should override this method to setup the device handler and create their
   * accessories.
   */
  protected abstract setup();

  /**
   * Creates an accessory with the given ID.
   * If a matching platform accessory is not found in cache, a new one will be created.
   * @param id - A unique identifier for this accessory.
   * @param nameSuffix - A string to append to the name of this accessory.
   * @param abilities - The abilities to add to this accessory.
   */
  protected createAccessory(id: AccessoryId, nameSuffix: string | null, ...abilities: Ability[]): Accessory {
    // make sure the given ID is unique
    if (this.accessories.has(id)) {
      throw new Error(`An accessory with ID '${id}' already exists`);
    }

    // generate a UUID for this accessory
    const uuid = this.platform.api.hap.uuid.generate(`${this.device.id}-${id}`);

    // see if there's a cached platform accessory with this UUID
    let pa = this.platform.cachedAccessories.get(uuid);
    let newAccessory = false;

    if (pa) {
      this.log.debug(`Accessory loaded from cache (id: ${id})`);
    } else {
      // if no cached platform accessory was found, we need to create a new one
      this.log.debug(`Creating new accessory (id: ${id})`);

      let name = this.options.name || this.device.modelName;
      if (nameSuffix) {
        name += ' ' + nameSuffix;
      }

      pa = this.createPlatformAccessory(uuid, name);
      newAccessory = true;
    }

    // create an accessory
    const accessory = new Accessory(
      pa,
      new AccessoryInformationAbility(this.device),
      ...abilities,
    );

    // store the accessory
    this.accessories.set(id, accessory);

    // setup all abilities
    for (const a of accessory.abilities) {
      a.setup(this, pa);
    }

    if (newAccessory) {
      // register the platform accessory with homebridge
      this.platform.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [pa]);
    }

    return accessory;
  }

  /**
   * Creates a new platform accessory with the given UUID.
   * @param uuid - A UUID.
   * @param name - A user friendly name.
   */
  protected createPlatformAccessory(uuid: string, name: string): PlatformAccessory {
    const d = this.device;

    // create a new accessory
    const pa = new this.platform.api.platformAccessory(
      name,
      uuid,
    );

    // store info in the context
    pa.context.device = {
      id: d.id,
    };

    return pa;
  }

  /**
   * Handles 'connect' events from the RPC handler.
   */
  protected handleConnect() {
    this.log.info('Device connected');
  }

  /**
   * Handles 'disconnect' events from the RPC handler.
   */
  protected handleDisconnect(code: number, reason: string) {
    this.log.info(`Device disconnected (reason: ${reason})`);
  }

  /**
   * Removes all event listeners from this device.
   */
  detach() {
    this.device
      .off('connect', this.handleConnect, this)
      .off('disconnect', this.handleDisconnect, this);

    // invoke detach() on all accessories
    for (const a of this.accessories.values()) {
      a.detach();
    }
  }

  /**
   * Destroys this device handler, removing all event listeners and unregistering all accessories.
   */
  destroy() {
    this.detach();

    // find all platform accessories
    const pas = Array.from(this.accessories.values()).map(a => a.platformAccessory);
    if (pas.length > 0) {
      // unregister the accessories from homebridge
      this.platform.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, pas);
    }

    this.log.info('Device removed');
  }
}
