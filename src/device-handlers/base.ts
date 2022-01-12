import { Device } from 'shellies-ng';
import { PlatformAccessory } from 'homebridge';

import { Ability } from '../abilities';
import { DeviceLogger } from '../utils/device-logger';
import { ShellyAccessory } from '../accessory';
import { PLATFORM_NAME, PLUGIN_NAME, ShellyPlatform } from '../platform';

type AccessoryId = string;

/**
 * A DeviceHandler manages accessories for a device.
 */
export class DeviceHandler {
  /**
   * Holds all accessories for this device.
   */
  protected readonly accessories: Map<AccessoryId, ShellyAccessory> = new Map();

  /**
   * Logger specific for this device.
   */
  readonly log: DeviceLogger;

  /**
   * @param device - The device to handle.
   * @param platform - A reference to the homebridge platform.
   */
  constructor(readonly device: Device, readonly platform: ShellyPlatform) {
    this.log = new DeviceLogger(device, platform.log);
    this.log.info('Device added');
  }

  /**
   * Creates an accessory with the given ID.
   * If a matching platform accessory is not found in cache, a new one will be created.
   * @param id - A unique identifier for this accessory.
   * @param name - A user friendly name.
   * @param abilities - The abilities to add to this accessory.
   */
  protected createAccessory(id: AccessoryId, name: string, ...abilities: Ability[]): ShellyAccessory {
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

      const deviceName = this.device.modelName;

      pa = this.createPlatformAccessory(uuid, `${deviceName} ${name}`);
      newAccessory = true;
    }

    // create an accessory
    const accessory = new ShellyAccessory(pa, ...abilities);

    // store the accessory
    this.accessories.set(id, accessory);

    // setup all abilities
    for (const a of abilities) {
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
    // create a new accessory
    const pa = new this.platform.api.platformAccessory(
      name,
      uuid,
    );

    // store info in the context
    pa.context.device = {
      id: this.device.id,
      model: this.device.model,
    };

    return pa;
  }

  /**
   * Removes all event listeners from this device.
   */
  detach() {
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
