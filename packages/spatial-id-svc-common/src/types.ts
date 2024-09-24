export interface SpatialIdentification {
  ID: string;
}

export interface Point {
  latitude: number;
  longitude: number;
  altitude: number;
  altitudeAttribute: AltitudeAttribute;
}

export type AltitudeAttribute =
  | 'ALTITUDE_ATTRIBUTE_ELIPSOIDE'
  | 'ALTITUDE_ATTRIBUTE_MSL'
  | 'ALTITUDE_ATTRIBUTE_AGL';

export enum RequestTypes {
  OBJECT_TYPE_UNSPECIFIED = 'OBJECT_TYPE_UNSPECIFIED',
  TERRAIN = 'TERRAIN',
  BUILDING = 'BUILDING',
  RESTRICTED_AREA = 'RESTRICTED_AREA',
  EMERGENCY_AREA = 'EMERGENCY_AREA',
  RESERVE_AREA = 'RESERVE_AREA',
  CHANNEL = 'CHANNEL',
  OVERLAY_AREA = 'OVERLAY_AREA',
  WEATHER = 'WEATHER',
  WEATHER_FORECAST = 'WEATHER_FORECAST',
  MICROWAVE = 'MICROWAVE',
  GROUND_RISK = 'GROUND_RISK',
  AIR_RISK = 'AIR_RISK',
  AIR_SPACE = 'AIR_SPACE',
}

export enum RestrictionTypes {
  TYPE_FREE = 'TYPE_FREE',
  TYPE_P = 'TYPE_P',
  TYPE_R = 'TYPE_R',
  TYPE_K = 'TYPE_K',
  TYPE_N = 'TYPE_N',
}
