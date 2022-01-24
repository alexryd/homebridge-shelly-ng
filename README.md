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

By default, devices will be discovered on your local network using mDNS and
WebSockets will then be used to communicate with them.

## Configuration

The following configuration options are available. Note that they are all optional.

```
{
  "devices": [
    {
      "id": "e.g. shellyplus1-abcdef123456",
      "name": "My Device",
      "exclude": false,
      "hostname": "e.g. 192.168.1.200"
    }
  ],
  "mdns": {
    "enable": true,
    "interface": "e.g. eth0 or 192.168.1.100"
  }
}
```

See below for descriptions of each configuration option.

| Option.                | Description |
| ---                    | ---         |
| `devices`.             | An array of one or more objects with options for specific devices. |
| `devices.id`.          | A device ID. |
| `devices.name`.        | The name of the device. This will be shown in the homebridge log and will be used as the default name when the device is added to HomeKit. Note though that setting this value after the device has been added will not change the name in HomeKit. If no name is specified, this plugin will use the device name set in the Shelly app, or the name of the device model. |
| `devices.exclude`      | Set this value to `true` to make this plugin ignore this device. |
| `devices.hostname`     | The IP address or hostname of the device. Set this value if your device can't be discovered automatically. |
| `mdns`                 | Settings for the mDNS device discovery service. |
| `mdns.enable`          | Set this value to `false` to disable automatic device discovery using mDNS. |
| `mdns.interface`       | The network interface to use when sending and receiving mDNS packets. You probably don't need to use this setting unless you know what you're doing. If not specified, all available network interfaces will be used. |
