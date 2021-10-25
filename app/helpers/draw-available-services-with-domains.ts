import { HaConnection } from '../home-assistant/haConnection';
import { firstValueFrom } from 'rxjs';
import { HassServices } from 'home-assistant-js-websocket';

export async function drawAvailableServicesWithDomains(connection: HaConnection) {
  const services: HassServices = await firstValueFrom(connection.subscribeServices());

  console.groupCollapsed('Services and Domains available list');
  Object.keys(services).forEach((serviceKey: string) => {
    console.groupCollapsed(serviceKey);
    console.table(
      Object.keys(services[serviceKey]).reduce((res: object, domainKey: string) => {
        res[`${ serviceKey }.${ domainKey }`] = {
          name: services[serviceKey][domainKey].name,
          desc: services[serviceKey][domainKey].description,
        }
        return res;
      }, {})
    );
    console.groupEnd();
  });
  console.groupEnd();
}
