# homebridge-shelly-ng

[Homebridge](https://homebridge.io) plugin for [Shelly](https://shelly.cloud),
enabling HomeKit support for the next generation of Shelly devices.

For the first generation, see [homebridge-shelly](https://github.com/alexryd/homebridge-shelly).

This plugin is under development.

## Supported devices

* [Shelly Plus 1](https://shelly.cloud/shelly-plus-1/)
* [Shelly Plus 1PM](https://shelly.cloud/shelly-plus-1pm/)
* [Shelly Pro 4PM](https://shelly.cloud/shelly-pro-smart-home-automation-solution/)

## Installation

Either install this plugin through [Homebridge Config UI X](https://github.com/oznu/homebridge-config-ui-x)
or manually by following these instructions:

1. Install Homebridge by [following the instructions](https://github.com/homebridge/homebridge/wiki).
2. Install this plugin by running `npm install -g homebridge-shelly-ng`.
3. Add this plugin to the Homebridge config.json:
  ```
  "platforms": [
    {
      "platform": "ShellyNG",
      "name": "Shelly NG"
    }
  ]
  ```
