import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { ConfigurationInterface } from './interface/configuration.interface';
import { LogLevelEnum } from './interface/logLevel.enum';

export async function bootstrap(): Promise<ConfigurationInterface> {

  const envFilePath: string = resolve(__dirname, './../../.env');
  if(existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath });
  }

  if(process.env.SUPERVISOR_TOKEN) {
    return {
      homeAssistantHost: 'http://supervisor/',
      homeAssistantToken: process.env.SUPERVISOR_TOKEN,
      logLevel: LogLevelEnum.WARNING,
      isDevelopment: process.env.MODE === 'develop',
    }
  } else if(!process.env.HOMEASSISTANT_HOST && !process.env.HOMEASSISTANT_TOKEN) {
    throw new Error('No required environment variables');
  } else {
    return {
      homeAssistantHost: process.env.HOMEASSISTANT_HOST,
      homeAssistantToken: process.env.HOMEASSISTANT_TOKEN,
      logLevel: LogLevelEnum.WARNING,
      isDevelopment: process.env.MODE === 'develop',
    }
  }

}
