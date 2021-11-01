import { bootstrap } from './configuration/bootstrap';
import { ConfigurationInterface } from './configuration/interface/configuration.interface';
import { HaConnection } from './home-assistant/haConnection';
import { drawAvailableServicesWithDomains } from './helpers/draw-available-services-with-domains';
import { drawAvailableEntities } from './helpers/draw-available-entities';
import { ScriptConductor } from './scripts/script-conductor';
import { EntityLogScript } from './scripts/custom_scripts/entity-log.script';
import { LightControlScript } from './scripts/custom_scripts/light-control.script';
import { FanControlScript } from './scripts/custom_scripts/fan-control.script';
import 'colors';

console.clear();

bootstrap().then(async (configuration: ConfigurationInterface) => {
  const haConnection = new HaConnection(configuration);
  await haConnection.createConnection();

  if (configuration.isDevelopment) {
    await drawAvailableServicesWithDomains(haConnection);
    await drawAvailableEntities(haConnection);
  }

  const scriptConductor = new ScriptConductor(
    [
      // EntityLogScript,
      LightControlScript,
      FanControlScript,
    ],
    haConnection
  );

  await scriptConductor.bootstrap();
});
