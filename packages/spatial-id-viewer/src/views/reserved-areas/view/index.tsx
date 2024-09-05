import { Cesium3DTileStyle } from 'cesium';
import Head from 'next/head';
import { useCallback } from 'react';
import { useLatest } from 'react-use';
import { useStore } from 'zustand';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import {
  deleteReservedArea,
  GetEmergencyAreas,
  getReservedArea,
  getReservedAreas,
  GetReservedAreasResponse,
  ReservedArea,
} from 'spatial-id-svc-area';
import { StreamResponse } from 'spatial-id-svc-base';
import { RequestTypes } from 'spatial-id-svc-common';

import { AreaViewer, createUseModels } from '#app/components/area-viewer';
import { DisplayDetails } from '#app/components/area-viewer/interface';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { dateToStringUnixTime } from '#app/utils/date-to-string-unix-time';
import { mapGetOrSet } from '#app/utils/map-get-or-set';
import { AdditionalSettings } from '#app/views/reserved-areas/view/additonal-settings';
import { useStoreApi, WithStore } from '#app/views/reserved-areas/view/store';

/** 表示するメタデータ */
interface ReservedAreaInfo extends Record<string, unknown> {
  id: string;
  spatialId: string;
}

const processReservedArea = (area: any, type: string) => {
  const areaId = area.objectId;
  const spatialIds = new Map<string, SpatialId<ReservedAreaInfo>>();
  for (const spatialIdent of area[type].voxelValues) {
    const spatialId = spatialIdent.id.ID;

    try {
      spatialIds.set(
        spatialId,
        SpatialId.fromString<ReservedAreaInfo>(spatialId, {
          id: areaId,
          spatialId,
        })
      );
    } catch (e) {
      console.error(e);
    }
  }
  return spatialIds;
};

const processReservedAreas = async (
  result: AsyncGenerator<StreamResponse<GetEmergencyAreas>>,
  type: string
) => {
  const areas = new Map<string, Map<string, SpatialId<ReservedAreaInfo>>>();
  for await (const resp of result) {
    for (const area of resp.result.objects) {
      const areaId = area.objectId;
      const spatialIds = mapGetOrSet(
        areas,
        areaId,
        () => new Map<string, SpatialId<ReservedAreaInfo>>()
      );

      for (const [key, value] of processReservedArea(area, type).entries()) {
        spatialIds.set(key, value);
      }
    }
  }

  return areas;
};

/** ID を指定してモデルを 1 つ取得する関数を返す React Hook */
const useLoadModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async (id: string) => {
    const spatialIds = processReservedArea(
      (await getReservedArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id })).result,
      'emergencyArea'
    );

    const model = new CuboidCollection<ReservedAreaInfo>(
      await Promise.all([...spatialIds.values()].map((s) => s.createCuboid()))
    );

    return model;
  }, []);

  return loadModel;
};

/** 空間 ID で範囲を指定してモデルを複数取得する関数を返す React Hook */
const useLoadModels = () => {
  // const store = useStoreApi();
  // const startTime = useLatest(useStore(store, (s) => s.startTime));
  // const endTime = useLatest(useStore(store, (s) => s.endTime));

  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModels = useCallback(async (displayDetails: DisplayDetails) => {
    displayDetails.figure.identification.ID = displayDetails.figure.identification.ID.toString();
    const areas = await processReservedAreas(
      getReservedAreas({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: displayDetails,
      }),
      'emergencyArea'
    );

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
      )) as [string, CuboidCollection<ReservedAreaInfo>][]
    );

    return models;
  }, []);

  return loadModels;
};

/** ID を指定してモデルを 1 つ削除する関数を返す React Hook */
const useDeleteModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const deleteModel = useCallback(async (id: string) => {
    await deleteReservedArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id });
  }, []);

  return deleteModel;
};

const ReservedAreasViewer = () => {
  const loadModel = useLoadModel();
  const loadModels = useLoadModels();
  const deleteModel = useDeleteModel();

  const useModels = createUseModels({
    loadModel,
    loadModels,
    deleteModel,
  });

  return (
    <>
      <Head>
        <title>緊急エリア予約の表示・削除</title>
      </Head>
      <AreaViewer
        featureName="緊急エリアの予約"
        useModels={useModels}
        tilesetStyle={tilesetStyle}
        requestType={RequestTypes.EMERGENCY_AREA}
      >
        <AdditionalSettings />
      </AreaViewer>
    </>
  );
};

const tilesetStyle = new Cesium3DTileStyle({
  color: 'rgba(0, 255, 255, 0.6)',
});

export default WithAuthGuard(WithStore(ReservedAreasViewer));
