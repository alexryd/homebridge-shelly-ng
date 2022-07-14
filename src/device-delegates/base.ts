import { Cover, Device, Switch } from 'shellies-ng';
import { PlatformAccessory } from 'homebridge';

import {
  Ability,
  AccessoryInformationAbility,
  CoverAbility,
  PowerMeterAbility,
  SwitchAbility,
} from '../abilities';
import { Accessory, AccessoryId } from '../accessory';
import { DeviceLogger } from '../utils/device-logger';
import { DeviceOptions } from '../config';
import { ShellyPlatform } from '../platform';

/**
 * Describes a device delegate class.
 */
export interface DeviceDelegateClass {
  new (device: Device, options: DeviceOptions, platform: ShellyPlatform): DeviceDelegate;
}

/**
 * Describes a device class.
 */
export interface DeviceClass {
  model: string;
}

/**
 * A DeviceDelegate manages accessories for a device.
 */
export abstract class DeviceDelegate {
  /**
   * Holds all registered subclasses.
   */
  private static readonly subclasses: Map<string, DeviceDelegateClass> = new Map();

  /**
   * Registers a device delegate, so that it can later be found based on its device class or model
   * using the `DeviceDelegate.getClass()` method.
   * @param cls - A subclass of `DeviceDelegate`.
   * @param deviceCls - A subclass of `Device`.
   */
  static registerClass(cls: DeviceDelegateClass, deviceCls: DeviceClass) {
    const mdl = deviceCls.model.toUpperCase();

    // make sure it's not already registered
    if (DeviceDelegate.subclasses.has(mdl)) {
      throw new Error(`A device delegate for ${deviceCls.model} has already been registered`);
    }

    // add it to the list
    DeviceDelegate.subclasses.set(mdl, cls);
  }

  /**
   * Returns the device delegate for the given device class or model, if one has been registered.
   * @param deviceClsOrModel - The device class or model designation to lookup.
   */
  static getClass(deviceClsOrModel: DeviceClass | string): DeviceDelegateClass | undefined {
    const mdl = typeof deviceClsOrModel === 'string' ? deviceClsOrModel : deviceClsOrModel.model;
    return DeviceDelegate.subclasses.get(mdl.toUpperCase());
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
   * Used to keep track of whether a connection had been established when the 'disconnect' event is emitted by our RPC handler.
   */
  protected connected: boolean;

  /**
   * @param device - The device to handle.
   * @param options - Configuration options for the device.
   * @param platform - A reference to the homebridge platform.
   */
  constructor(readonly device: Device, readonly options: DeviceOptions, readonly platform: ShellyPlatform) {
    this.log = new DeviceLogger(device, options.name, platform.log);
    this.log.info('Device added');

    this.log.debug(device.rpcHandler.connected ? 'Device is connected' : 'Device is disconnected');

    this.connected = device.rpcHandler.connected;

    device.rpcHandler
      .on('connect', this.handleConnect, this)
      .on('disconnect', this.handleDisconnect, this)
      .on('request', this.handleRequest, this);

    this.setup();
  }

  /**
   * Subclasses should override this method to setup the device delegate and create their
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

    let name = this.options.name || this.device.modelName;
    if (nameSuffix) {
      name += ' ' + nameSuffix;
    }

    // create an accessory
    const accessory = new Accessory(
      id,
      this.device.id,
      name,
      this.platform,
      this.log,
      new AccessoryInformationAbility(this.device),
      ...abilities,
    );

    // store the accessory
    this.accessories.set(id, accessory);

    return accessory;
  }

  /**
   * Creates a switch accessory.
   * @param swtch - The switch component to use.
   * @param single - Whether the device has a single switch.
   */
  protected createSwitch(swtch: Switch, single = false): Accessory {
    const id = single ? 'switch' : `switch-${swtch.id}`;
    const nameSuffix = single ? null : `Switch ${swtch.id + 1}`;

    return this.createAccessory(
      id,
      nameSuffix,
      new SwitchAbility(swtch),
      // use the apower property to determine whether power metering is available
      new PowerMeterAbility(swtch).setActive(swtch.apower !== undefined),
    );
  }

  /**
   * Creates a cover accessory.
   * @param cover - The cover component to use.
   */
  protected createCover(cover: Cover): Accessory {
    return this.createAccessory(
      'cover',
      'Window',
      new CoverAbility(cover, 'window'),
      new PowerMeterAbility(cover),
    );
  }

  /**
   * Handles 'connect' events from the RPC handler.
   */
  protected handleConnect() {
    this.log.info('Device connected');
    this.connected = true;
  }

  /**
   * Handles 'disconnect' events from the RPC handler.
   */
  protected handleDisconnect(code: number, reason: string, reconnectIn: number | null) {
    const details = reason.length > 0 ? 'reason: ' + reason : 'code: ' + code;
    this.log.warn((this.connected ? 'Device disconnected' : 'Connection failed') + ' (' + details + ')');

    if (reconnectIn !== null) {
      let msg = 'Reconnecting in ';

      if (reconnectIn < 60 * 1000) {
        msg += Math.floor(reconnectIn / 1000) + ' second(s)';
      } else if (reconnectIn < 60 * 60 * 1000) {
        msg += Math.floor(reconnectIn / (60 * 1000)) + ' minute(s)';
      } else {
        msg += Math.floor(reconnectIn / (60 * 60 * 1000)) + ' hour(s)';
      }

      this.log.info(msg);
    }

    this.connected = false;
  }

  /**
   * Handles 'request' events from the RPC handler.
   */
  protected handleRequest(method: string) {
    this.log.debug('WebSocket:', method);
  }

  /**
   * Removes all event listeners from this device.
   */
  detach() {
    this.device.rpcHandler
      .off('connect', this.handleConnect, this)
      .off('disconnect', this.handleDisconnect, this)
      .off('request', this.handleRequest, this);

    // invoke detach() on all accessories
    for (const a of this.accessories.values()) {
      a.detach();
    }
  }

  /**
   * Destroys this device delegate, removing all event listeners and unregistering all accessories.
   */
  destroy() {
    this.detach();

    // find all platform accessories
    const pas = Array.from(this.accessories.values())
      .map(a => a.platformAccessory)
      .filter(a => a !== null) as PlatformAccessory[];

    if (pas.length > 0) {
      // remove the accessories from the platform
      this.platform.removeAccessory(...pas);
    }

    this.log.info('Device removed');
  }
}
