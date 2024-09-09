import { error, SpatialDefinition, success } from 'src/client-blocked-areas';

import { ApiResponseError, AuthInfo, fetchJson } from 'spatial-id-svc-base';

export interface OverlayAreaRquest {
  overwrite: boolean;
  object: SpatialDefinition;
}

export interface CreateOverlayAreaParams {
  baseUrl: string;
  authInfo: AuthInfo;
  payload: OverlayAreaRquest;
  abortSignal?: AbortSignal;
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
