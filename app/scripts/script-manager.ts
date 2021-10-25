import { HaConnection } from '../home-assistant/haConnection';
import { ScriptConductor } from './script-conductor';
import { filter, Observable, Subject } from 'rxjs';
import { HassEntities, HassEntity, HassServices } from 'home-assistant-js-websocket';
import { Type } from '../interfaces/type.interface';

export abstract class ScriptManager {

  protected destroy$ = new Subject<void>();

  public isActivated: boolean = true;

  constructor(private haConnection: HaConnection, private scriptConductor: ScriptConductor) {
    this.scriptConductor.onScriptRun$
      .pipe(
        filter(script => this instanceof script)
      )
      .subscribe(async () => {
        await this.initializeScriptEnvironment();
        await this.run();
      });

    this.scriptConductor.onScriptStop$
      .pipe(
        filter(script => this instanceof script)
      )
      .subscribe(async () => {
        await this.destroy();
      });
  }

  private async initializeScriptEnvironment() {
    this.destroy$ = new Subject();
  }

  public abstract run(): Promise<void>;

  public async destroy(): Promise<void> {
    this.destroy$.next();
    this.destroy$.complete();
  };

  public subscribeEntities(): Observable<HassEntities> {
    return this.haConnection.subscribeEntities();
  }

  public subscribeEntitiesStateUpdate(): Observable<HassEntity> {
    return this.haConnection.subscribeEntitiesStateUpdate();
  }

  public getEntityState(entityId: string): Promise<HassEntity> {
    return this.haConnection.getEntityState(entityId);
  }

  public getEntityState$(entityId: string): Observable<HassEntity> {
    return this.haConnection.getEntityState$(entityId);
  }

  public subscribeServices(): Observable<HassServices> {
    return this.haConnection.subscribeServices();
  }

  public callService(domainAndService: string, targetEntityId?: string, data?: object): Promise<void> {
    return this.haConnection.callService(domainAndService, targetEntityId, data);
  }

  async startScript(constructorScript: Type<ScriptManager>) {
    await this.scriptConductor.startScript(constructorScript);
  }

  async stopScript(constructorScript: Type<ScriptManager>) {
    await this.scriptConductor.stopScript(constructorScript);
  }}
