import {
  Auth,
  Connection,
  createConnection,
  createLongLivedTokenAuth,
  callService,
  HassEntities,
  HassEntity,
  HassServices,
  subscribeEntities,
  subscribeServices,
} from 'home-assistant-js-websocket';
import { createSocket } from './socket';
import { ConfigurationInterface } from '../configuration/interface/configuration.interface';
import { concat, defer, filter, firstValueFrom, from, map, Observable, pairwise, startWith, switchMap } from 'rxjs';
import { differenceWith, isEqual, values } from 'lodash'

export class HaConnection {

  private connection: Connection;

  constructor(private configuration: ConfigurationInterface) {
  }

  public async createConnection() {
    const auth: Auth = createLongLivedTokenAuth(
      this.configuration.homeAssistantHost,
      this.configuration.homeAssistantToken,
    );

    this.connection = await createConnection({
      auth,
      createSocket: async () => createSocket(auth, this.configuration),
    });

    console.info(`Connected to Home Assistant: Host ${ this.configuration.homeAssistantHost }`.cyan);
  }

  public subscribeEntities(): Observable<HassEntities> {
    return new Observable(observer => {
      const unsubscribe = subscribeEntities(this.connection, (states: HassEntities) => {
        observer.next(states);
      });

      observer.add(() => unsubscribe());
    });
  }

  public subscribeEntitiesStateUpdate(): Observable<HassEntity> {
    return this.subscribeEntities().pipe(
      pairwise(),
      switchMap(([prev, current]: [HassEntities, HassEntities]) => {
        return from<HassEntity[]>(
          differenceWith(
            values(current),
            values(prev),
            isEqual
          )
        );
      }),
    );
  }

  public getEntityState(entityId: string): Promise<HassEntity> {
    return firstValueFrom(this.subscribeEntities().pipe(
      map(states => states[entityId]),
    ));
  }

  public getEntityState$(entityId: string): Observable<HassEntity> {
    return defer(() => concat(this.getEntityState(entityId), this.subscribeEntitiesStateUpdate().pipe(
      filter(state => state.entity_id === entityId),
    )));
  }

  public subscribeServices(): Observable<HassServices> {
    return new Observable(observer => {
      const unsubscribe = subscribeServices(this.connection, (services: HassServices) => {
        observer.next(services);
      });

      observer.add(() => unsubscribe());
    });
  }

  public callService(domainAndService: string, targetEntityId?: string, data?: object): Promise<void> {
    const [domain, service] = domainAndService.split('.');
    return callService(
      this.connection,
      domain,
      service,
      data,
      targetEntityId ? { entity_id: targetEntityId } : undefined
    ).then();
  }
}
