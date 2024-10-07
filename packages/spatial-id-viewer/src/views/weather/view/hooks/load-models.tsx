import { useCallback } from 'react';
import { useLatest } from 'react-use';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import {
  deleteWeather,
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

interface WeatherInfo extends Record<string, unknown> {
  id: string;
  spatialId: string;
  startTime: string;
  endTime: string;
  windDirection: number;
  windSpeed: number;
  cloudRate: number;
  temperature?: number;
  dewPoint?: number;
  pressure?: number;
  precipitation: number;
  visibility?: number;
  gggg?: string;
}

export const useLoadModel = (type: string) => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async (id: string) => {
    const spatialIds = processWeather(
      (await getWeather({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id })).result,
      type
    );

    const model = new CuboidCollection<WeatherInfo>(
      await Promise.all([...spatialIds.values()].map((s) => s.createCuboid()))
    );

    return model;
  }, []);

  return loadModel;
};

export const useLoadModels = (type: string) => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModels = useCallback(async (displayDetails: DisplayDetails) => {
    const areas = await processWeathers(
      getWeatherAreas({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: displayDetails as GetWeatherRequest,
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
      )) as [string, CuboidCollection<WeatherInfo>][]
    );

    return models;
  }, []);

  return loadModels;
};

export const useDeleteModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const deleteModel = useCallback(async (id: string) => {
    await deleteWeather({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id });
  }, []);

  return deleteModel;
};

export const processWeather = (area: any, type: string) => {
  const areaId = area.objectId;
  const spatialIds = new Map<string, SpatialId<WeatherInfo>>();
  for (const spatialIdentification of area[type].voxelValues) {
    const spatialId = spatialIdentification.id.ID;
    try {
      if (type === 'weather') {
        spatialIds.set(
          spatialId,
          SpatialId.fromString<WeatherInfo>(spatialId, {
            id: areaId,
            ...spatialIdentification.currentWeather,
          })
        );
      } else {
        spatialIds.set(
          spatialId,
          SpatialId.fromString<WeatherInfo>(spatialId, {
            id: areaId,
            ...spatialIdentification.forecast,
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  return spatialIds;
};

interface GetAreas {
  objects: SpatialDefinition[];
}

export const processWeathers = async (
  result: AsyncGenerator<StreamResponse<GetAreas>>,
  type: string
) => {
  const areas = new Map<string, Map<string, SpatialId<WeatherInfo>>>();
  for await (const resp of result) {
    for (const area of resp.result.objects) {
      const areaId = area.objectId;
      const spatialIds = mapGetOrSet(
        areas,
        areaId,
        () => new Map<string, SpatialId<WeatherInfo>>()
      );

      for (const [spatialId, spatialIdObj] of processWeather(area, type).entries()) {
        spatialIds.set(spatialId, spatialIdObj);
      }
    }
  }

  return areas;
};

export const convertToModels = async (areas: Map<string, Map<string, SpatialId<WeatherInfo>>>) => {
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
    )) as [string, CuboidCollection<WeatherInfo>][]
  );

  return models;
};
