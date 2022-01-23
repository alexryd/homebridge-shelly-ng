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
   * Whether the device should be excluded.
   */
  exclude: boolean;
  /**
   * The protocol to use when communicating with the device.
   */
  protocol: 'websocket';
}

const DEFAULT_DEVICE_OPTIONS: Readonly<DeviceOptions> = {
  exclude: false,
  protocol: 'websocket',
};

export interface PlatformOptions {
  /**
   * Options for the mDNS device discoverer.
   */
  mdns: MdnsOptions;
  /**
   * Device specific configuration options.
   */
  deviceOptions: Map<DeviceId, DeviceOptions>;
}

/**
 * Takes the platform configuration supplied by homebridge and adds default values.
 * @param config - The platform configuration.
 */
export const getPlatformOptions = (config: PlatformConfig): PlatformOptions => {
  // get the mDNS options
  const mdns = { ...DEFAULT_MDNS_OPTIONS, ...config.mdns };

  // get the device options
  const deviceOptions = new Map<DeviceId, DeviceOptions>();

  if (Array.isArray(config.devices)) {
    // loop through each item and add default values
    for (const d of config.devices) {
      if (d.id) {
        deviceOptions.set(d.id, { ...DEFAULT_DEVICE_OPTIONS, ...d });
      }
    }
  }

  return {
    mdns,
    deviceOptions,
  };
};
