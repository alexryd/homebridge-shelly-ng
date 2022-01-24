import { PlatformConfig } from 'homebridge';

import { DeviceId } from 'shellies-ng';

export interface MdnsOptions {
  /**
   * Whether device discovery using mDNS should be enabled.
   */
  enable: boolean;
  /**
   * The network interface to use. If none is specified, all available
   * interfaces will be used.
   */
  interface?: string;
}

const DEFAULT_MDNS_OPTIONS: Readonly<MdnsOptions> = {
  enable: true,
};

export interface DeviceOptions {
  /**
   * The name of the device.
   */
  name?: string;
  /**
   * Whether the device should be excluded.
   */
  exclude: boolean;
  /**
   * The protocol to use when communicating with the device.
   */
  protocol: 'websocket';
  /**
   * The IP address or hostname of the device.
   */
  hostname?: string;
}

const DEFAULT_DEVICE_OPTIONS: Readonly<DeviceOptions> = {
  exclude: false,
  protocol: 'websocket',
};

/**
 * Handles configuration options for the platform.
 */
export class PlatformOptions {
  /**
   * Options for the mDNS device discoverer.
   */
  readonly mdns: MdnsOptions;
  /**
   * Device specific configuration options.
   */
  readonly deviceOptions: Map<DeviceId, DeviceOptions> = new Map();

  /**
   * @param config - The platform configuration.
   */
  constructor(config: PlatformConfig) {
    // store the mDNS options (with default values)
    this.mdns = { ...DEFAULT_MDNS_OPTIONS, ...config.mdns };

    // store the device options
    if (Array.isArray(config.devices)) {
      // loop through each item and add default values
      for (const d of config.devices) {
        if (d && d.id) {
          this.deviceOptions.set(d.id, { ...DEFAULT_DEVICE_OPTIONS, ...d });
        }
      }
    }
  }

  /**
   * Return the configuration options for the device with the given ID.
   * If no options have been specified, default values will be returned.
   * @param deviceId - The device ID.
   */
  getDeviceOptions(deviceId: DeviceId): DeviceOptions {
    return this.deviceOptions.get(deviceId) || DEFAULT_DEVICE_OPTIONS;
  }
}
