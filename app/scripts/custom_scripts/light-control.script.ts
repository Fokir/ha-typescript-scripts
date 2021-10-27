import { ScriptManager } from '../script-manager';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil } from 'rxjs';
import { getTimeMs } from '../../helpers/getTimeMs';
import { EntityIdEnum } from './enum/entityId.enum';


export class LightControlScript extends ScriptManager {

  async run(): Promise<void> {
    this.startWatchLightTime(EntityIdEnum.TualetLight, getTimeMs(0, 1));
    this.startWatchLightTime(EntityIdEnum.VannaLight, getTimeMs(0, 3));
  }

  private startWatchLightTime(entity: EntityIdEnum, time: number) {
    this.getEntityState$(entity)
      .pipe(
        map(state => state.state),
        distinctUntilChanged(),
        debounceTime(time),
        filter(state => state === 'on'),
        takeUntil(this.destroy$)
      )
      .subscribe(async (state) => {
        await this.callService('switch.turn_off', entity);
      });
  }

}
