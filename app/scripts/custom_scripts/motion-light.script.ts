import { ScriptManager } from '../script-manager';
import { EntityIdEnum } from './enum/entityId.enum';
import { distinctUntilChanged, firstValueFrom, map, takeUntil } from 'rxjs';

export class MotionLightScript extends ScriptManager {

  async run(): Promise<void> {
    const koridorLight = this.getEntityState$(EntityIdEnum.KoridorLight);

    this.getEntityState$(EntityIdEnum.KoridorMotion).pipe(
      map(entity => entity.state),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(async state => {
      const lightEntitySnapshot = await firstValueFrom(koridorLight);

      if(state === 'on' && lightEntitySnapshot.state === 'off') {
        await this.callService('switch.turn_on', lightEntitySnapshot.entity_id);
      } else if(state === 'off' && lightEntitySnapshot.state === 'on') {
        await this.callService('switch.turn_off', lightEntitySnapshot.entity_id);
      }
    });
  }
}
