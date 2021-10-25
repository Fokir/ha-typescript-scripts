import { Type } from '../interfaces/type.interface';
import { ScriptManager } from './script-manager';
import { HaConnection } from '../home-assistant/haConnection';
import { Subject } from 'rxjs';

export class ScriptConductor {

  public onScriptRun$: Subject<Type<ScriptManager>> = new Subject<Type<ScriptManager>>();
  public onScriptStop$: Subject<Type<ScriptManager>> = new Subject<Type<ScriptManager>>();

  private scriptsInstancesList: ScriptManager[] = [];

  constructor(private scriptsList: Type<ScriptManager>[], private haConnection: HaConnection) {
  }

  async bootstrap(): Promise<void> {
    this.scriptsInstancesList = this.scriptsList.map((constructorScript) => {
      return new constructorScript(this.haConnection, this);
    });

    this.scriptsInstancesList.forEach((script: ScriptManager) => {
      if(script.isActivated) {
        script.run();
      }
    });
  }

  async startScript(constructorScript: Type<ScriptManager>) {
    if(this.scriptsInstancesList.some(script => script instanceof constructorScript && !script.isActivated)) {
      this.onScriptRun$.next(constructorScript);
    }
  }

  async stopScript(constructorScript: Type<ScriptManager>) {
    if(this.scriptsInstancesList.some(script => script instanceof constructorScript && script.isActivated)) {
      this.onScriptStop$.next(constructorScript);
    }
  }
}
