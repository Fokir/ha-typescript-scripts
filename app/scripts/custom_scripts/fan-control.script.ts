import { ScriptManager } from '../script-manager';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  pairwise,
  skip,
  switchMap,
  take,
  takeUntil, timer,
} from 'rxjs';
import { EntityIdEnum } from './enum/entityId.enum';
import { getTimeMs } from '../../helpers/getTimeMs';

type TualetStateType = ['on' | 'off', Date];

export class FanControlScript extends ScriptManager {

  async run(): Promise<void> {
    this.runTualet();
  }

  runTualet(): void {
    const fun$ = this.getEntityState$(EntityIdEnum.TualetFan);
    const funOffTakeUntil$ = fun$.pipe(skip(1), filter(state => state.state === 'off'), take(1));

    this.getEntityState$(EntityIdEnum.TualetLight)
      .pipe(
        map(state => state.state),
        filter(state => state === 'on' || state === 'off'),
        distinctUntilChanged(),
        map(state => [state, new Date] as TualetStateType),
        pairwise<TualetStateType>(),
        takeUntil(this.destroy$),
        switchMap(([[, prevTimeUpdate], [state, timeUpdate]]) => {
          if (state === 'on') {
            return of('on');
          } else if (state === 'off') {
            const timeDelta = timeUpdate.valueOf() - prevTimeUpdate.valueOf();

            if (timeDelta < getTimeMs(0, 0, 1, 30)) {
              return of('off');
            } else {
              return timer(getTimeMs(0, 0, 10)).pipe(
                map(() => 'off'),
                takeUntil(funOffTakeUntil$)
              );
            }
          }

          return of('off');
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(async state => {
        await this.callService(`switch.turn_${ state }`, EntityIdEnum.TualetFan);
      })
  }
}
