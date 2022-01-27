import { Logger } from 'homebridge';
import { promises as fs } from 'fs';
import { resolve } from 'path';

import { Device, DeviceId, WebSocketRpcHandler } from 'shellies-ng';

const FILENAME = '.shelly-ng.json';

const SAVE_DELAY = 1000;

export interface CachedDeviceInfo {
  /**
   * Device ID.
   */
  id: DeviceId;
  /**
   * Device model.
   */
  model: string;
  /**
   * RPC handler protocol.
   */
  protocol: string;
  /**
   * The device's IP address or hostname.
   */
  hostname?: string;
}

export interface DeviceStorage {
  devices: CachedDeviceInfo[];
}

/**
 * Handles saving and loading device information to a cache file.
 */
export class DeviceCache {
  /**
   * A path to the cache file.
   */
  readonly path: string;

  /**
   * Holds all devices loaded from the cache file.
   */
  protected devices = new Map<DeviceId, CachedDeviceInfo>();

  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * @param storagePath - A path to the directory that the devices will be stored in.
   * @param log - A logging device.
   */
  constructor(storagePath: string, readonly log: Logger) {
    this.path = resolve(storagePath, FILENAME);
  }

  /**
   * Loads cached devices.
   */
  async load() {
    // remove any previously loaded devices
    this.devices.clear();

    try {
      // see if the cache file exists
      await fs.access(this.path);
    } catch (_) {
      // the file doesn't exist
      this.log.debug('Device cache file not found');
      return;
    }

    // read the file
    const data: string = await fs.readFile(this.path, { encoding: 'utf8' });
    const s = JSON.parse(data) as DeviceStorage;

    this.log.debug(`Loaded ${s.devices.length} device(s) from cache`);

    // store the loaded devices
    for (const d of s.devices) {
      this.devices.set(d.id, d);
    }
  }

  /**
   * Saves the devices to cache.
   */
  async save() {
    // serialize the devices
    const s = { devices: Array.from(this.devices.values()) };
    const data = JSON.stringify(s);

    this.log.debug(`Saving ${s.devices.length} device(s) to cache`);

    // write them to disk
    return fs.writeFile(this.path, data);
  }

  /**
   * Saves the devices to cache after a short delay.
   * Multiple calls to this method within the delay will be debounced.
   */
  saveDelayed() {
    // clear any previously set timeout
    if (this.saveTimeout !== null) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(async () => {
      this.saveTimeout = null;

      try {
        await this.save();
      } catch (e) {
        this.log.error(
          'Failed to save devices to cache:',
          e instanceof Error ? e.message : e,
        );
      }
    }, SAVE_DELAY);
  }

  /**
   * Returns device info for the given device ID.
   */
  get(id: DeviceId): CachedDeviceInfo | undefined {
    return this.devices.get(id);
  }

  /**
   * Stores the given device info.
   * @param d - The device info.
   * @param autoSave - Whether `saveDelayed()` should be automatically invoked.
   */
  set(d: CachedDeviceInfo, autoSave = true) {
    this.devices.set(d.id, d);

    if (autoSave === true) {
      this.saveDelayed();
    }
  }

  /**
   * Stores info about the given device in cache.
   * @param device - The device.
   * @param autoSave - Whether `saveDelayed()` should be automatically invoked.
   */
  storeDevice(device: Device, autoSave = true) {
    const protocol = device.rpcHandler.protocol;
    let hostname;

    if (protocol === 'websocket') {
      hostname = (device.rpcHandler as WebSocketRpcHandler).hostname;
    }

    this.set(
      {
        id: device.id,
        model: device.model,
        protocol,
        hostname,
      },
      autoSave,
    );
  }

  /**
   * Deletes info about the device with the given ID from cache.
   * @param id - The device ID.
   * @param autoSave - Whether `saveDelayed()` should be automatically invoked.
   */
  delete(id: DeviceId, autoSave = true) {
    this.devices.delete(id);

    if (autoSave === true) {
      this.saveDelayed();
    }
  }

  /**
   * Returns a new Iterator object that contains each device.
   */
  [Symbol.iterator](): IterableIterator<CachedDeviceInfo> {
    return this.devices.values();
  }
}
