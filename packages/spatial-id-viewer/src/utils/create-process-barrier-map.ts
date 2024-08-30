import { SpatialId } from 'spatial-id-converter';
import { StreamResponse } from 'spatial-id-svc-base';
import { SpatialDefinition, SpatialDefinitions } from 'spatial-id-svc-route';

import { mapGetOrSet } from '#app/utils/map-get-or-set';

/** 表示するメタデータ */
export interface BuildingBarrierInfo extends Record<string, unknown> {
  id: string;
  spatialId: string;
}

export const createBarrierMap = (
  map: Map<string, Map<string, SpatialId<BuildingBarrierInfo>>>,
  object: any,
  type: string
) => {
  const barrierId = object.objectId;
  const spatialIds = mapGetOrSet(
    map,
    barrierId,
    () => new Map<string, SpatialId<BuildingBarrierInfo>>()
  );

  for (const barrierDefinition of object[type].voxelValues) {
    const spatialId = barrierDefinition.id.ID;
    if (spatialIds.has(spatialId)) {
      continue;
    }

    try {
      spatialIds.set(
        spatialId,
        SpatialId.fromString<BuildingBarrierInfo>(spatialId, {
          id: barrierId,
          spatialId,
          // risk: 10,
        })
      );
    } catch (e) {
      console.error(e);
    }
  }

  return map;
};

export const processBarriers = async (
  result: AsyncGenerator<StreamResponse<SpatialDefinition | SpatialDefinitions>>,
  type: string
) => {
  let barriers = new Map<string, Map<string, SpatialId<BuildingBarrierInfo>>>();
  for await (const resp of result) {
    if ('objectId' in resp.result) {
      barriers = createBarrierMap(barriers, resp.result, type);
    } else if ('objects' in resp.result) {
      for (const object of resp.result.objects) {
        barriers = createBarrierMap(barriers, object, type);
      }
    }
  }
  return barriers;
};
