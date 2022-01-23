import { Device } from 'shellies-ng';
import { Logger, LogLevel } from 'homebridge';

/**
 * Utility used to prefix log messages with device IDs.
 */
export class DeviceLogger {
  protected readonly prefix: string;

  /**
   * @param device - The device to use.
   * @param deviceName - A user-friendly name of the device.
   * @param logger - The logging device to write to.
   */
  constructor(readonly device: Device, deviceName: string | undefined, protected readonly logger: Logger) {
    this.prefix = `[${deviceName || device.id}] `;
  }

  info(message: string, ...parameters: unknown[]) {
    this.log(LogLevel.INFO, message, ...parameters);
  }

  warn(message: string, ...parameters: unknown[]) {
    this.log(LogLevel.WARN, message, ...parameters);
  }

  error(message: string, ...parameters: unknown[]) {
    this.log(LogLevel.ERROR, message, ...parameters);
  }

  debug(message: string, ...parameters: unknown[]) {
    this.log(LogLevel.DEBUG, message, ...parameters);
  }

  log(level: LogLevel, message: string, ...parameters: unknown[]) {
    this.logger.log(
      level,
      this.prefix + message,
      ...parameters,
    );
  }
}
