import { ScriptManager } from '../script-manager';
import { EntityIdEnum } from './enum/entityId.enum';
import { distinctUntilChanged, map, takeUntil } from 'rxjs';
import { ServiceIdEnum } from './enum/serviceId.enum';

export class WaterLeakScript extends ScriptManager {

  async run(): Promise<void> {
    this.getEntityState$(EntityIdEnum.VannaWaterLeak).pipe(
      map(entity => entity.state),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(async state => {
      if (state === 'on') {
        await this.callService(ServiceIdEnum.AndreyIphoneNotify, undefined, {
          title: 'Протечка в ванной!',
          message: 'Обнаружена протечка в ванной!',
          data: {
            push: {
              sound: {
                name: "default",
                critical: 1,
                volume: 1
              }
            }
          }
        });

        // перекрыть краны!
      }
    })
  }
}
