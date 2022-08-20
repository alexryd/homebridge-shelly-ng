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

export interface WebSocketOptions {
  /**
   * The time, in seconds, to wait for a response before a request is aborted.
   */
  requestTimeout: number;
  /**
   * The interval, in seconds, at which ping requests should be made to verify that the connection is open.
   * Set to `0` to disable.
   */
  pingInterval: number;
  /**
   * The interval, in seconds, at which a connection attempt should be made after a socket has been closed.
   * If an array is specified, the first value of the array will be used for the first connection attempt, the second
   * value for the second attempt and so on. When the last item in the array has been reached, it will be used for
   * all subsequent connection attempts; unless the value is `0`, in which case no more attempts will be made.
   * Set to `0` or an empty array to disable.
   */
  reconnectInterval: number | number[];
}

const DEFAULT_WEB_SOCKET_OPTIONS: Readonly<WebSocketOptions> = {
  requestTimeout: 10,
  pingInterval: 60,
  reconnectInterval: [
    5,
    10,
    30,
    60,
    5 * 60, // 5 minutes
    10 * 60, // 10 minutes
  ],
};

export interface SwitchOptions {
  /**
   * Whether this switch should be excluded.
   */
  exclude?: boolean;
  /**
   * The type of accessory used to represent the switch.
   */
  type?: 'outlet' | 'switch';
}

export interface CoverOptions {
  /**
   * Whether this cover should be excluded.
   */
  exclude?: boolean;
  /**
   * The type of accessory used to represent the cover.
   */
  type?: 'door' | 'window' | 'windowCovering';
}

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
  /**
   * The password to use if the Shelly device requires authentication.
   */
  password?: string;
  /**
   * Options for devices that have one or more switch.
   */
  [ 'switch:0' ]?: SwitchOptions;
  /**
   * Options for devices that have multiple switches.
   */
  [ 'switch:1' ]?: SwitchOptions;
  /**
   * Options for devices that have multiple switches.
   */
  [ 'switch:2' ]?: SwitchOptions;
  /**
   * Options for devices that have multiple switches.
   */
  [ 'switch:3' ]?: SwitchOptions;
  /**
   * Options for devices that have a cover.
   */
  [ 'cover:0' ]?: CoverOptions;
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
   * Options for WebSocket connections.
   */
  readonly websocket: WebSocketOptions;
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

    // allow websocket.reconnectInterval to be a string of comma-separated numbers
    if (typeof config.websocket?.reconnectInterval === 'string') {
      const intervals: number[] = [];

      for (const i of config.websocket.reconnectInterval.split(',')) {
        intervals.push(parseInt(i, 10));
      }

      config.websocket.reconnectInterval = intervals;
    }

    // store the WebSocket options (with default values)
    this.websocket = { ...DEFAULT_WEB_SOCKET_OPTIONS, ...config.websocket };

    // store the device options
    if (Array.isArray(config.devices)) {
      // loop through each item and add default values
      for (const d of config.devices) {
        if (d && typeof d.id === 'string') {
          this.deviceOptions.set(d.id.toLowerCase(), { ...DEFAULT_DEVICE_OPTIONS, ...d });
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
