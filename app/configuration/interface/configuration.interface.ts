import { LogLevelEnum } from './logLevel.enum';

export interface ConfigurationInterface {
  homeAssistantHost: string;
  homeAssistantToken: string;
  logLevel: LogLevelEnum;
  isDevelopment: boolean;
}
