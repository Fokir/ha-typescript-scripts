import { ScriptManager } from '../script-manager';
import { EntityIdEnum } from './enum/entityId.enum';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil, tap } from 'rxjs';

export class ButtonsScript extends ScriptManager {
  async run(): Promise<void> {
    this.getEntityState$(EntityIdEnum.ZalButton).pipe(
      map(entity => entity.attributes.action),
      distinctUntilChanged(),
      filter(Boolean),
      takeUntil(this.destroy$)
    ).subscribe(async state => {
      if(state === 'single') {
        await this.callService('switch.toggle', EntityIdEnum.ZalCompLight);
      } else if(state === 'double') {
        await this.callService('switch.toggle', EntityIdEnum.ZalDivanLight);
        await this.callService('switch.toggle', EntityIdEnum.ZalLineLight);
      } else if(state === 'hold') {
        await this.callService('switch.turn_off', EntityIdEnum.ZalCompLight);
        await this.callService('switch.turn_off', EntityIdEnum.ZalDivanLight);
        await this.callService('switch.turn_off', EntityIdEnum.ZalLineLight);
      }
    });
  }
}
