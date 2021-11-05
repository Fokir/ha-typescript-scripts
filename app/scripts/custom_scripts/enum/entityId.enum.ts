export enum EntityIdEnum {
  // Туалет
  TualetLight = 'switch.tualet_light',
  TualetFan = 'switch.tualet_fun',

  // Ванная
  VannaLight = 'switch.vanna_light',
  VannaFan = 'switch.vanna_fan',
  VannaWaterLeak = 'binary_sensor.water_leak_vanna_water_leak',

  // Коридор
  KoridorMotion = 'binary_sensor.motion_koridor_occupancy',
  KoridorLight = 'switch.koridor_light',

  // Зал
  ZalButton = 'sensor.button_zal_action',
  ZalLineLight = 'switch.zal_line_light',
  ZalCompLight = 'switch.zal_comp_light',
  ZalDivanLight = '  switch.zal_divan_light',
}
