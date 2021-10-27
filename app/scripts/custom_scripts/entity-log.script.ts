import { ScriptManager } from '../script-manager';
import { takeUntil } from 'rxjs';

export class EntityLogScript extends ScriptManager {
  async run(): Promise<void> {
    this.subscribeEntitiesStateUpdate().pipe(
      takeUntil(this.destroy$)
    ).subscribe((entity) => {
      console.log(`Entity "${entity.entity_id}" updated, new state ${entity.state}, userId: ${ entity.context?.user_id }`);
    })
  }
}
