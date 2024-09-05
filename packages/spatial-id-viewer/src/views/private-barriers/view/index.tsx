import { Cesium3DTileStyle } from 'cesium';
import Head from 'next/head';
import { useCallback } from 'react';
import { useLatest } from 'react-use';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import { RequestTypes } from 'spatial-id-svc-common';
import { deleteBarrier, getPrivateBarrier, getPrivateBarriers } from 'spatial-id-svc-route';

import { AreaViewer, createUseModels } from '#app/components/area-viewer';
import { DisplayDetails } from '#app/components/area-viewer/interface';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { Info, processBarriers } from '#app/utils/create-process-barrier-map';

/** ID を指定してモデルを 1 件取得する関数を返す React Hook */
const useLoadModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async (id: string) => {
    const barriers = await processBarriers(
      getPrivateBarrier({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id }),
      'building'
    );
    const barrier = barriers.get(id);
    if (barrier === undefined) {
      throw new Error(`private barrier ${id} not found in response`);
    }

    const model = new CuboidCollection<Info>(
      await Promise.all([...barrier.values()].map((b) => b.createCuboid()))
    );
    return model;
  }, []);

  return loadModel;
};

/** 空間 ID で範囲を指定してモデルを複数取得する関数を返す React Hook */
const useLoadModels = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModels = useCallback(async (displayDetails: DisplayDetails) => {
    displayDetails.figure.identification.ID = displayDetails.figure.identification.ID.toString();
    const barriers = await processBarriers(
      getPrivateBarriers({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: displayDetails,
      }),
      'building'
    );

    const models = new Map(
      (await Promise.all(
        [...barriers.entries()]
          .filter(([, v]) => v.size)
          .map(async ([barrierId, spatialIds]) => [
            barrierId,
            new CuboidCollection(
              await Promise.all([...spatialIds.values()].map((s) => s.createCuboid()))
            ),
          ])
      )) as [string, CuboidCollection<Info>][]
    );

    return models;
  }, []);

  return loadModels;
};

/** ID を指定してモデルを削除する関数を返す React Hook */
const useDeleteModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const deleteModel = useCallback(async (id: string) => {
    await deleteBarrier({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id });
  }, []);

  return deleteModel;
};

const PrivateBarriersViewer = () => {
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
        <title>建物の障壁表示・削除</title>
      </Head>
      <AreaViewer
        featureName="建物の障壁"
        useModels={useModels}
        tilesetStyle={tilesetStyle}
        requestType={RequestTypes.TERRAIN}
      />
    </>
  );
};

const tilesetStyle = new Cesium3DTileStyle({
  // color: 'hsla(clamp(${feature["risk"]}, 0, 10) / 10, 1, 0.85, 0.95)',
  color: 'hsla(0.7, 1, 0.85, 0.95)',
});

export default WithAuthGuard(PrivateBarriersViewer);
