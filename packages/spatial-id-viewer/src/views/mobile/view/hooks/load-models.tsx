import { useCallback } from 'react';
import { useLatest } from 'react-use';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import {
  deleteSignal,
  deleteWeather,
  getSignalArea,
  getSignalAreas,
  GetSignalRequest,
  getWeather,
  getWeatherAreas,
  GetWeatherRequest,
  SpatialDefinition,
} from 'spatial-id-svc-area';
import { StreamResponse } from 'spatial-id-svc-base';

import { DisplayDetails } from '#app/components/area-viewer/interface';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { mapGetOrSet } from '#app/utils/map-get-or-set';

interface SignalInfo extends Record<string, unknown> {
  id: string;
  RSI: number;
}

export const useLoadModel = (type: string) => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async (id: string) => {
    const spatialIds = processSignal(
      (await getSignalArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id })).result,
      type
    );

    const model = new CuboidCollection<SignalInfo>(
      await Promise.all([...spatialIds.values()].map((s) => s.createCuboid()))
    );

    return model;
  }, []);

  return loadModel;
};

export const useLoadModels = (type: string) => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModels = useCallback(async (displayDetails: DisplayDetails) => {
    const spatialID = displayDetails.figure.identification.ID;
    const newSpatialID = new SpatialId(
      spatialID.z,
      spatialID.f,
      spatialID.x,
      spatialID.y
    ).toString();
    displayDetails.figure.identification.ID = newSpatialID;
    const areas = await processSignals(
      getSignalAreas({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: displayDetails as GetSignalRequest,
      }),
      type
    );

    const models = new Map(
      (await Promise.all(
        [...areas.entries()]
          .filter(([, v]) => v.size)
          .map(async ([barrierId, spatialIds]) => [
            barrierId,
            new CuboidCollection(
              await Promise.all([...spatialIds.values()].map((s) => s.createCuboid()))
            ),
          ])
      )) as [string, CuboidCollection<SignalInfo>][]
    );

    return models;
  }, []);

  return loadModels;
};

export const useDeleteModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const deleteModel = useCallback(async (id: string) => {
    await deleteSignal({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id });
  }, []);

  return deleteModel;
};

export const processSignal = (area: any, type: string) => {
  const areaId = area.objectId;
  const spatialIds = new Map<string, SpatialId<SignalInfo>>();
  const areaType = area.microwave;
  for (const spatialIdentification of areaType[type].voxelValues) {
    const spatialId = spatialIdentification.id.ID;
    try {
      spatialIds.set(
        spatialId,
        SpatialId.fromString<SignalInfo>(spatialId, {
          id: areaId,
          RSI: spatialIdentification.RSI,
        })
      );
    } catch (e) {
      console.error(e);
    }
  }

  return spatialIds;
};

interface GetAreas {
  objects: SpatialDefinition[];
}

export const processSignals = async (
  result: AsyncGenerator<StreamResponse<GetAreas>>,
  type: string
) => {
  const areas = new Map<string, Map<string, SpatialId<SignalInfo>>>();
  for await (const resp of result) {
    for (const area of resp.result.objects) {
      const areaId = area.objectId;
      const spatialIds = mapGetOrSet(areas, areaId, () => new Map<string, SpatialId<SignalInfo>>());

      for (const [spatialId, spatialIdObj] of processSignal(area, type).entries()) {
        spatialIds.set(spatialId, spatialIdObj);
      }
    }
  }

  return areas;
};

export const convertToModels = async (areas: Map<string, Map<string, SpatialId<SignalInfo>>>) => {
  const models = new Map(
    (await Promise.all(
      [...areas.entries()]
        .filter(([, v]) => v.size)
        .map(async ([areaId, spatialIds]) => [
          areaId,
          new CuboidCollection(
            await Promise.all([...spatialIds.values()].map((s) => s.createCuboid()))
          ),
        ])
    )) as [string, CuboidCollection<SignalInfo>][]
  );

  return models;
};
