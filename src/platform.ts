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

import { CustomCharacteristics, createCharacteristics } from './utils/characteristics';
import { CustomServices, createServices } from './utils/services';
import { DeviceCache } from './utils/device-cache';
import { DeviceDelegate } from './device-delegates';
import { PlatformOptions } from './config';

type AccessoryUuid = string;

/**
 * The name of this plugin.
 */
export const PLUGIN_NAME = 'homebridge-shelly-ng';

/**
 * The name of this homebridge platform.
 */
export const PLATFORM_NAME = 'ShellyNG';

/**
 * Utility class that "discovers" devices from the configuration options.
 */
export class ConfigDeviceDiscoverer extends DeviceDiscoverer {
  /**
   * @param options - The platform configuration options.
   * @param emitInterval - The interval, in milliseconds, to wait between each emitted device.
   */
  constructor(readonly options: PlatformOptions, readonly emitInterval = 20) {
    super();
  }

  /**
   * Runs this discoverer.
   */
  async run() {
    // emit all devices that have a configured hostname
    for (const [id, opts] of this.options.deviceOptions) {
      if (opts.hostname) {
        await this.emitDevice({
          deviceId: id,
          hostname: opts.hostname,
        });
      }
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
 * Implements a homebridge dynamic platform plugin.
 */
export class ShellyPlatform implements DynamicPlatformPlugin {
  /**
   * The configuration options for this platform.
   */
  readonly options: PlatformOptions;

  /**
   * A set of custom HomeKit characteristics.
   */
  readonly customCharacteristics: CustomCharacteristics;

  /**
   * A set of custom HomeKit services.
   */
  readonly customServices: CustomServices;

  /**
   * A reference to the shellies-ng library.
   */
  protected readonly shellies: Shellies;

  /**
   * Holds all platform accessories that were loaded from cache during launch,
   * as well as accessories that have been created since launch.
   */
  protected readonly accessories: Map<AccessoryUuid, PlatformAccessory> = new Map();

  /**
   * A reference to our cached devices.
   */
  readonly deviceCache: DeviceCache;

  /**
   * Holds all device delegates.
   */
  readonly deviceDelegates: Map<DeviceId, DeviceDelegate> = new Map();

  /**
   * This constructor is invoked by homebridge.
   * @param log - A logging device for this platform.
   * @param config - Configuration options for this platform.
   * @param api - A reference to the homebridge API.
   */
  constructor(
    readonly log: Logger,
    config: PlatformConfig,
    readonly api: API,
  ) {
    // get the platform options
    this.options = new PlatformOptions(config);

    this.customCharacteristics = Object.freeze(createCharacteristics(api));
    this.customServices = Object.freeze(createServices(api, this.customCharacteristics));

    // setup shellies-ng
    this.shellies = new Shellies({
      websocket: { ...this.options.websocket, clientId: 'homebridge-shelly-ng-' + Math.round(Math.random() * 1000000) },
      autoLoadStatus: true,
      autoLoadConfig: true,
      deviceOptions: this.options.deviceOptions,
    });
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
    this.accessories.set(accessory.UUID, accessory);
  }

  /**
   * Returns the platform accessory with the given UUID.
   * @param uuid - The UUID.
   */
  getAccessory(uuid: AccessoryUuid): PlatformAccessory | undefined {
    return this.accessories.get(uuid);
  }

  /**
   * Adds one or more platform accessories to this platform.
   * This method will also register the accessories with homebridge.
   * @param accessories - The platform accessories to add.
   */
  addAccessory(...accessories: PlatformAccessory[]) {
    if (accessories.length === 0) {
      return;
    }

    const accs: PlatformAccessory[] = [];

    // add the accessories to our list
    for (const pa of accessories) {
      // skip if this accessory has already been added
      if (this.accessories.has(pa.UUID)) {
        continue;
      }

      this.accessories.set(pa.UUID, pa);
      accs.push(pa);
    }

    // register the accessories with homebridge
    this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, accs);
  }

  /**
   * Removes one or more platform accessories from this platform.
   * This method will also unregister the accessories from homebridge.
   * @param accessories - The platform accessories to remove.
   */
  removeAccessory(...accessories: PlatformAccessory[]) {
    if (accessories.length === 0) {
      return;
    }

    // remove the accessories from our list
    for (const pa of accessories) {
      this.accessories.delete(pa.UUID);
    }

    // unregister the accessories from homebridge
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, accessories);
  }

  /**
   * Initializes this platform.
   */
  protected async initialize() {
    this.log.debug(
      this.accessories.size === 1
        ? 'Loaded 1 accessory from cache'
        : `Loaded ${this.accessories.size} accessories from cache`,
    );

    await this.runConfigDeviceDiscoverer();

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

    if (this.options.mdns.enable === true) {
      this.startMdnsDeviceDiscovery();
    } else {
      this.log.debug('mDNS device discovery disabled');
    }
  }

  /**
   * Discovers all devices found in the configuration.
   */
  protected runConfigDeviceDiscoverer(): Promise<void> {
    // create a device discoverer
    const discoverer = new ConfigDeviceDiscoverer(this.options);
    // register it
    this.shellies.registerDiscoverer(discoverer);
    // run it
    return discoverer.run();
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
    const discoverer = new MdnsDeviceDiscoverer(this.options.mdns);
    // register it
    this.shellies.registerDiscoverer(discoverer);

    // log errors
    discoverer.on('error', (error: Error) => {
      this.log.error('An error occurred in the mDNS device discovery service:', error.message);
      this.log.debug(error.stack || '');
    });

    try {
      // start the service
      await discoverer.start();

      this.log.info('mDNS device discovery started');
    } catch (e) {
      this.log.error('Failed to start the mDNS device discovery service:', e instanceof Error ? e.message : e);
      if (e instanceof Error && e.stack) {
        this.log.debug(e.stack);
      }
    }
  }

  /**
   * Handles 'add' events from the shellies-ng library.
   */
  protected async handleAddedDevice(device: Device) {
    // make sure this device hasn't already been added
    if (this.deviceDelegates.has(device.id)) {
      this.log.error(`Device with ID ${device.id} has already been added`);
      return;
    }

    // get the device delegate class for this device
    const cls = DeviceDelegate.getDelegate(device.model);
    if (cls === undefined) {
      // this is an unknown device
      this.handleUnknownDevice(device.id, device.model);
      return;
    }

    // get the configuration options for this device (and copy them)
    const opts = { ...this.options.getDeviceOptions(device.id) };

    // if no name has been specified...
    if (!opts.name) {
      // use the name from the API
      opts.name = device.system.config?.device?.name;
    }

    // create a delegate for this device
    const delegate = new cls(device, opts, this);

    // store the delegate
    this.deviceDelegates.set(device.id, delegate);

    // store info about this device in cache
    this.deviceCache.storeDevice(device);
  }

  /**
   * Handles 'remove' events from the shellies-ng library.
   */
  protected handleRemovedDevice(device: Device) {
    // destroy and remove the device delegate
    this.deviceDelegates.get(device.id)?.destroy();
    this.deviceDelegates.delete(device.id);

    // delete this device from cache
    this.deviceCache.delete(device.id);
  }

  /**
   * Handles 'exclude' events from the shellies-ng library.
   */
  protected handleExcludedDevice(deviceId: DeviceId) {
    this.log.info(`[${deviceId}] Device excluded`);

    // delete this device from cache
    this.deviceCache.delete(deviceId);

    if (this.deviceDelegates.has(deviceId)) {
      // destroy and remove the device delegate
      this.deviceDelegates.get(deviceId)!.destroy();
      this.deviceDelegates.delete(deviceId);
    } else {
      // find all of its platform accessories
      const pas: PlatformAccessory[] = [];

      for (const pa of this.accessories.values()) {
        if (pa.context.device?.id === deviceId) {
          pas.push(pa);
        }
      }

      // unregister them
      if (pas.length > 0) {
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, pas);
      }

      this.log.debug(
        pas.length === 1
          ? '1 platform accessory unregistered'
          : `${pas.length} platform accessories unregistered`,
      );
    }
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
  protected handleError(deviceId: DeviceId, error: Error) {
    // print the error to the log
    this.log.error(error.message);
    this.log.debug(error.stack || '');
  }
}
