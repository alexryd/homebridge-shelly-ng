import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
} from 'homebridge';

import {
  Device,
  DeviceId,
  MdnsDeviceDiscoverer,
  Shellies,
} from 'shellies-ng';

import { DeviceHandler } from './device-handlers';

type AccessoryUUID = string;

/**
 * Implements a homebridge dynamic platform plugin.
 */
export class ShellyPlatform implements DynamicPlatformPlugin {
  /**
   * A reference to the shellies-ng library.
   */
  protected readonly shellies: Shellies;

  /**
   * Holds all platform accessories that were loaded from cache during launch.
   */
  readonly cachedAccessories: Map<AccessoryUUID, PlatformAccessory> = new Map();

  /**
   * Holds all device handlers.
   */
  readonly deviceHandlers: Map<DeviceId, DeviceHandler> = new Map();

  /**
   * This constructor is invoked by homebridge.
   * @param log - A logging device for this platform.
   * @param config - Cobfiguration options for this platform.
   * @param api - A reference to the homebridge API.
   */
  constructor(
    readonly log: Logger,
    readonly config: PlatformConfig,
    readonly api: API,
  ) {
    // setup shellies-ng
    this.shellies = new Shellies();
    this.shellies
      .on('add', this.handleAddedDevice, this)
      .on('remove', this.handleRemovedDevice, this)
      .on('error', this.handleError, this);

    // wait for homebridge to finish launching
    api.on('didFinishLaunching', this.initialize.bind(this));
  }

  /**
   * Configures cached accessories.
   * This method is invoked once for each cached accessory that is loaded during launch.
   */
  configureAccessory(accessory: PlatformAccessory) {
    // store it for later
    this.cachedAccessories.set(accessory.UUID, accessory);
  }

  /**
   * Initializes this platform.
   */
  protected initialize() {
    this.shellies.registerDiscoverer(
      new MdnsDeviceDiscoverer(),
    );
  }

  /**
   * Handles 'add' events from the shellies-ng library.
   */
  protected handleAddedDevice(device: Device) {
    // make sure this device hasn't already been added
    if (this.deviceHandlers.has(device.id)) {
      this.log.error(`Device with ID ${device.id} has already been added`);
      return;
    }

    // create a handler for this device
    this.deviceHandlers.set(
      device.id,
      new DeviceHandler(device, this),
    );
  }

  /**
   * Handles 'remove' events from the shellies-ng library.
   */
  protected handleRemovedDevice(device: Device) {
    // destroy and remove the device handler
    this.deviceHandlers.get(device.id)?.destroy();
    this.deviceHandlers.delete(device.id);
  }

  /**
   * Handles 'error' events from the shellies-ng library.
   */
  protected handleError(error: Error) {
    // print the error to the log
    this.log.error('', error);
  }
}
