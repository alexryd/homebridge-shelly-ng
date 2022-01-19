import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
} from 'homebridge';

import {
  Device,
  DeviceDiscoverer,
  DeviceId,
  DeviceIdentifiers,
  MdnsDeviceDiscoverer,
  Shellies,
} from 'shellies-ng';

import { DeviceCache } from './utils/device-cache';
import { DeviceHandler } from './device-handlers';

type AccessoryUUID = string;

/**
 * The name of this plugin.
 */
export const PLUGIN_NAME = 'homebridge-shelly-ng';

/**
 * Utility class that "discovers" devices from a cache.
 */
export class CacheDeviceDiscoverer extends DeviceDiscoverer {
  /**
   * @param deviceCache - The cached devices.
   * @param emitInterval - The interval, in milliseconds, to wait between each emitted device.
   */
  constructor(readonly deviceCache: DeviceCache, readonly emitInterval = 20) {
    super();
  }

  /**
   * Runs this discoverer.
   */
  async run() {
    // emit all cached devices
    for (const d of this.deviceCache) {
      await this.emitDevice({
        deviceId: d.id,
        hostname: d.hostname,
      });
    }
  }

  /**
   * Emits a device after the configured time interval has passed.
   */
  protected emitDevice(identifiers: DeviceIdentifiers): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.handleDiscoveredDevice(identifiers);
        resolve();
      }, this.emitInterval);
    });
  }
}

/**
 * The name of this homebridge platform.
 */
export const PLATFORM_NAME = 'shelly-ng';

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
   * A reference to our cached devices.
   */
  readonly deviceCache: DeviceCache;

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
      .on('exclude', this.handleExcludedDevice, this)
      .on('unknown', this.handleUnknownDevice, this)
      .on('error', this.handleError, this);

    this.deviceCache = new DeviceCache(api.user.storagePath(), log);

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
  protected async initialize() {
    this.log.debug(
      this.cachedAccessories.size === 1
        ? 'Loaded 1 accessory from cache'
        : `Loaded ${this.cachedAccessories.size} accessories from cache`,
    );

    // load cached devices
    try {
      await this.deviceCache.load();
    } catch (e) {
      this.log.error(
        'Failed to load cached devices:',
        e instanceof Error ? e.message : e,
      );
    }

    await this.runCacheDeviceDiscoverer();

    this.startMdnsDeviceDiscovery();
  }

  /**
   * Discovers all devices found in cache.
   */
  protected runCacheDeviceDiscoverer(): Promise<void> {
    // create a device discoverer
    const discoverer = new CacheDeviceDiscoverer(this.deviceCache);
    // register it
    this.shellies.registerDiscoverer(discoverer);
    // run it
    return discoverer.run();
  }

  /**
   * Starts device discovery over mDNS.
   */
  protected async startMdnsDeviceDiscovery() {
    // create a device discoverer
    const discoverer = new MdnsDeviceDiscoverer();
    // register it
    this.shellies.registerDiscoverer(discoverer);

    try {
      // start it
      await discoverer.start();

      this.log.info('mDNS device discovery started');
    } catch (e) {
      this.log.error('Failed to start the mDNS device discovery service', e);
    }
  }

  /**
   * Handles 'add' events from the shellies-ng library.
   */
  protected async handleAddedDevice(device: Device) {
    // make sure this device hasn't already been added
    if (this.deviceHandlers.has(device.id)) {
      this.log.error(`Device with ID ${device.id} has already been added`);
      return;
    }

    // get the device handler class for this device
    const cls = DeviceHandler.getClass(device.model);
    if (cls === undefined) {
      // this is an unknown device
      this.handleUnknownDevice(device.id, device.model);
      return;
    }

    // load the system configuration for this device
    const sysConfig = await device.system.getConfig();

    // create a handler for this device
    const handler = new cls(
      device,
      sysConfig.device?.name || null,
      this,
    );

    // store the handler
    this.deviceHandlers.set(device.id, handler);

    // store info about this device in cache
    this.deviceCache.storeDevice(device);
  }

  /**
   * Handles 'remove' events from the shellies-ng library.
   */
  protected handleRemovedDevice(device: Device) {
    // destroy and remove the device handler
    this.deviceHandlers.get(device.id)?.destroy();
    this.deviceHandlers.delete(device.id);

    // delete this device from cache
    this.deviceCache.delete(device.id);
  }

  /**
   * Handles 'exclude' events from the shellies-ng library.
   */
  protected handleExcludedDevice(deviceId: DeviceId) {
    this.log.info(`[${deviceId}] Device excluded`);
  }

  /**
   * Handles 'unknown' events from the shellies-ng library.
   */
  protected handleUnknownDevice(deviceId: DeviceId, model: string) {
    this.log.info(`[${deviceId}] Unknown device of model "${model}" discovered.`);
  }

  /**
   * Handles 'error' events from the shellies-ng library.
   */
  protected handleError(error: Error) {
    // print the error to the log
    this.log.error('', error);
  }
}
