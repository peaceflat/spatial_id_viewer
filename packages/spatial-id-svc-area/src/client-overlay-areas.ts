import {
  ApiResponseError,
  AuthInfo,
  CommonResponseHeader,
  fetchJson,
  fetchJsonStream,
} from 'spatial-id-svc-base';

import {
  error,
  ErrorResponse,
  GetAreaRequest,
  SpatialDefinition,
  SpatialDefinitions,
  success,
} from './client-blocked-areas';

export interface GetOverlayAreas {
  objects: SpatialDefinition[];
}
export interface OverlayAreaRquest {
  overwrite: boolean;
  object: SpatialDefinition;
}

export interface GetOverlayAreasResponse {
  responseHeader?: CommonResponseHeader;
  objects: SpatialDefinition[];
}
export interface CreateOverlayAreaParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: OverlayAreaRquest;
  abortSignal?: AbortSignal;
}

export interface GetOverlayAreaParams {
  baseUrl: string;
  authInfo: AuthInfo;
  id: string;
  abortSignal?: AbortSignal;
}
export interface GetOverlayAreasParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: GetAreaRequest;
  abortSignal?: AbortSignal;
}

export interface DeleteOverlayAreaParams {
  baseUrl: string;
  authInfo: AuthInfo;
  id: string;
  abortSignal?: AbortSignal;
}
export interface GetOverlayAreaResponse extends SpatialDefinition {
  responseHeader?: CommonResponseHeader;
  result: SpatialDefinition;
  error: ErrorResponse;
}

export const createOverlayArea = async ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: CreateOverlayAreaParams) => {
  const resp = await fetchJson<success | error>({
    method: 'POST',
    baseUrl,
    path: '/uas/api/airmobility/v3/put-object',
    authInfo,
    payload,
    abortSignal,
  });

  if ('code' in resp) {
    throw new ApiResponseError('failed to create: error occured with code ' + resp.code);
  }
  return resp;
};

export const getOverlayArea = async ({
  baseUrl,
  authInfo,
  id,
  abortSignal,
}: GetOverlayAreaParams) => {
  return await fetchJson<GetOverlayAreaResponse>({
    method: 'POST',
    baseUrl,
    path: '/uas/api/airmobility/v3/get-object',
    authInfo,
    payload: { objectId: id },
    abortSignal,
  });
};

export const getOverlayAreas = async function* ({
  baseUrl,
  authInfo,
  payload,
  abortSignal,
}: GetOverlayAreasParams) {
  for await (const chunk of fetchJsonStream<GetOverlayAreasResponse>({
    method: 'POST',
    baseUrl,
    path: '/uas/api/airmobility/v3/get-value',
    authInfo,
    payload,
    abortSignal,
  })) {
    yield chunk;
  }
};

export const deleteOverlayArea = async ({
  baseUrl,
  authInfo,
  id,
  abortSignal,
}: DeleteOverlayAreaParams) => {
  await fetchJson({
    method: 'POST',
    baseUrl,
    path: `/uas/api/airmobility/v3/delete-object`,
    authInfo,
    payload: { objectId: id },
    abortSignal,
  });
};
