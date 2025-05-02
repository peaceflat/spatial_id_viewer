import Head from 'next/head';
import { useCallback } from 'react';
import { useLatest } from 'react-use';

import { BarrierDefinitionVoxel, BarrierNew, createBuildingBarrier } from 'spatial-id-svc-route';

import { AreaCreator, IAreas } from '#app/components/area-creator';
import { WithAuthGuard } from '#app/components/auth-guard';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { AreaAdditionalInfo, WholeAreaInfo } from '#app/views/private-barriers/create/interfaces';

/** モデルを登録する関数を返す React Hook */
const useRegister = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const register = useCallback(async (areas: IAreas<WholeAreaInfo, AreaAdditionalInfo>) => {
    const payload = {
      overwrite: false,
      object: {
        building: {
          reference: 'BTS84',
          voxelValues: areas.data
            .map((area) =>
              area.spatialIds.map((spatialId) => {
                return {
                  id: {
                    ID: spatialId,
                  },
                  vacant: true,
                } as BarrierDefinitionVoxel;
              })
            )
            .flat(),
        },
      },
    } as BarrierNew;

    return await createBuildingBarrier({
      baseUrl: apiBaseUrl,
      authInfo: authInfo.current,
      payload,
    });
  }, []);

  return register;
};

const PrivateBarrierCreator = () => {
  const register = useRegister();

  return (
    <>
      <Head>
        <title>プライベートバリア生成</title>
      </Head>
      <AreaCreator<WholeAreaInfo, AreaAdditionalInfo>
        register={register}
        areaAdditionalInfoFragment={null}
        wholeAreaInfoFragment={null}
      />
    </>
  );
};

export default WithAuthGuard(PrivateBarrierCreator);
