import { HaConnection } from '../home-assistant/haConnection';
import { firstValueFrom } from 'rxjs';
import { HassEntities, HassEntity } from 'home-assistant-js-websocket';
import { values } from 'lodash';

export async function drawAvailableEntities(connection: HaConnection) {
  const entities: HassEntities = await firstValueFrom(connection.subscribeEntities());

  console.groupCollapsed('Entities available list');
  console.table(
    values(entities).reduce((res: object, entity: HassEntity) => {
      res[entity.entity_id] = {
        friendly_name: entity.attributes.friendly_name,
        state: entity.state,
      }
      return res;
    }, {})
  );
  console.groupEnd();
}
