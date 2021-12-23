import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
} from 'homebridge';

export class ShellyPlatform implements DynamicPlatformPlugin {
  constructor(
    readonly log: Logger,
    readonly config: PlatformConfig,
    readonly api: API,
  ) {
    // ...
  }

  /**
   * Configures cached accessories.
   * This method is invoked once for each cached accessory that is loaded during launch.
   */
  configureAccessory(accessory: PlatformAccessory) {
    // ...
  }
}
