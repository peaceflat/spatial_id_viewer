import { Cartographic, Math as CesiumMath, WebMercatorTilingScheme } from 'cesium';
import Head from 'next/head';
import { useCallback } from 'react';
import { useLatest } from 'react-use';

import { SpatialId } from 'spatial-id-converter';
import { Point } from 'spatial-id-svc-common';
import { createReservedRoute, CreateReservedRouteRequest } from 'spatial-id-svc-route';

import { WithAuthGuard } from '#app/components/auth-guard';
import {
  addErroredPathsFromErrorDef,
  InvalidPathError,
  IWaypoints,
  RouteCreator,
} from '#app/components/route-creator';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { dateToStringUnixTime } from '#app/utils/date-to-string-unix-time';
import { RouteInfoFragment } from '#app/views/reserved-routes/create/fragments/route-info';
import { WholeRouteInfoFragment } from '#app/views/reserved-routes/create/fragments/whole-route-info';
import { RouteInfo, WholeRouteInfo } from '#app/views/reserved-routes/create/interfaces';

const defaultZ = 20;
/** ルート登録関数を返す React Hook */
const useRegister = () => {
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const register = useCallback(async (waypoints: IWaypoints<WholeRouteInfo, RouteInfo, never>) => {
    const waypointsForApi = waypoints.data.map((wp) => {
      console.log(waypoints.routeInfo);
      const cart = Cartographic.fromCartesian(wp.point);
      const { x, y } = new WebMercatorTilingScheme().positionToTileXY(
        Cartographic.fromCartesian(wp.point),
        defaultZ
      );
      const spatialID = new SpatialId(defaultZ, wp.altitude, x, y).toString();
      console.log('spatialID', spatialID);
      // return {
      //   latitude: CesiumMath.toDegrees(cart.latitude),
      //   longitude: CesiumMath.toDegrees(cart.longitude),
      //   altitude: wp.altitude,
      //   altitudeAttribute: 'ALTITUDE_ATTRIBUTE_MSL',
      // } as Point;
      return {
        id: { ID: spatialID },
        reservationTime: {
          period: {
            startTime: waypoints.routeInfo.startTime,
            endTime: waypoints.routeInfo.endTime,
          },
          occupation: waypoints.routeInfo.occupation,
          reserveId: waypoints.routeInfo.reservationId,
        },
      };
    });

    // const payload = {
    //   clearance: waypoints.wholeRouteInfo.clearance,
    //   ignoreReservedRouteIds: [],
    //   waypoints: waypointsForApi,
    //   aircraftId: waypoints.wholeRouteInfo.aircraftId,
    //   startTime: dateToStringUnixTime(waypoints.wholeRouteInfo.startTime),
    //   endTime: dateToStringUnixTime(waypoints.wholeRouteInfo.endTime),
    //   reservationMethod: waypoints.wholeRouteInfo.reservationMethod,
    //   uavInfo: {
    //     uavSize: String(waypoints.wholeRouteInfo.uavSize),
    //   },
    //   ignoreSpatialId: true,
    // } as CreateReservedRouteRequest;
    const payload = {
      overwrite: false,
      // area: waypointsForApi,
      object: {
        reserveArea: {
          ownerId: 'thinira',
          reservationTime: waypointsForApi[0].reservationTime,
          voxelValues: waypointsForApi,
        },
      },
    };
    console.log(payload);

    // let errored = false;
    // const erroredPathIndices = new Set<number>();
    // for await (const resp of createReservedRoute({
    //   baseUrl: apiBaseUrl,
    //   authInfo: authInfo.current,
    //   payload,
    // })) {
    //   if (resp.result?.result.Error != null) {
    //     errored = true;
    //     addErroredPathsFromErrorDef(erroredPathIndices, resp.result.result.Error);
    //   }
    // }
    return await createReservedRoute({ baseUrl: apiBaseUrl, authInfo: authInfo.current, payload });

    // if (errored) {
    //   throw new InvalidPathError(erroredPathIndices);
    // }
  }, []);

  return register;
};

const ReservedRouteCreator = () => {
  const register = useRegister();

  return (
    <>
      <Head>
        <title>予約ルート生成</title>
      </Head>
      <RouteCreator<WholeRouteInfo, RouteInfo, never>
        register={register}
        routeInfoFragment={RouteInfoFragment}
        // wholeRouteInfoFragment={WholeRouteInfoFragment}
      />
    </>
  );
};

export default WithAuthGuard(ReservedRouteCreator);
