import { Cesium3DTileStyle } from 'cesium';
import Head from 'next/head';
import { useCallback, useMemo, useRef } from 'react';
import { useLatest, useUnmount } from 'react-use';

import { CuboidCollection, SpatialId } from 'spatial-id-converter';
import { deleteOverlayArea, getOverlayArea, getOverlayAreas } from 'spatial-id-svc-area';
import { RequestTypes } from 'spatial-id-svc-common';

import { AreaViewer, createUseModels, ModelControllers } from '#app/components/area-viewer';
import { DisplayDetails } from '#app/components/area-viewer/interface';
import { IStore } from '#app/components/area-viewer/store';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { convertToModels, processArea, processAreas } from '#app/utils/create-areas';
import { WithStore } from '#app/views/blocked-areas/view/store';

interface OverlayAreaInfo extends Record<string, unknown> {
  id: string;
  spatialId: string;
}

const useLoadModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const loadModel = useCallback(async (id: string) => {
    const spatialIds = processArea(
      (await getOverlayArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id })).result,
      'overlayArea'
    );

    const model = new CuboidCollection<OverlayAreaInfo>(
      await Promise.all([...spatialIds.values()].map((s) => s.createCuboid()))
    );

    return model;
  }, []);

  return loadModel;
};

const useLoadModels = () => {
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
    const areas = await processAreas(
      getOverlayAreas({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: displayDetails,
      }),
      'overlayArea'
    );

    const models = await convertToModels(areas);
    return models;
  }, []);

  return loadModels;
};

const useDeleteModel = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const deleteModel = useCallback(async (id: string) => {
    await deleteOverlayArea({ baseUrl: apiBaseUrl, authInfo: authInfo.current, id });
  }, []);

  return deleteModel;
};

const useModels = (store: IStore<OverlayAreaInfo>): ModelControllers => {
  const loadModelImpl = useLoadModel();
  const loadModelsImpl = useLoadModels();
  const deleteModelImpl = useDeleteModel();

  const abortControllerRef = useRef<AbortController | null>(null);

  const onUnloadModels = useCallback(async () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const useModelsBase = createUseModels({
    loadModel: loadModelImpl,
    loadModels: loadModelsImpl,
    deleteModel: deleteModelImpl,
    onUnloadModels,
  });

  const { loadModel, loadModels: loadModelsBase, deleteModel, unloadModels } = useModelsBase(store);

  const loadModels = async (bbox: DisplayDetails) => {
    await loadModelsBase(bbox);
  };

  useUnmount(() => {
    abortControllerRef.current?.abort();
  });

  return useMemo(() => ({ loadModel, loadModels, deleteModel, unloadModels }), []);
};

const OverlayAreasViewer = () => {
  return (
    <>
      <Head>
        <title>オーバーレイエリアの予約表示/削除</title>
      </Head>
      <AreaViewer
        featureName="オーバーレイエリアの予約"
        useModels={useModels}
        tilesetStyle={tilesetStyle}
        requestType={RequestTypes.OVERLAY_AREA}
      ></AreaViewer>
    </>
  );
};

const tilesetStyle = new Cesium3DTileStyle({
  color: 'rgba(0, 255, 255, 0.6)',
});

export default WithAuthGuard(WithStore(OverlayAreasViewer));
