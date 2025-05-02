import { Viewer as CesiumViewer } from 'cesium';
import { Button } from 'flowbite-react';
import Head from 'next/head';
import { useRef, useState } from 'react';
import { useLatest } from 'react-use';
import { CesiumComponentRef } from 'resium';

import { createReservedRoute } from 'spatial-id-svc-route';

import { WithAuthGuard } from '#app/components/auth-guard';
import { Navigation, NavigationButtons } from '#app/components/navigation';
import { Viewer, ViewerContainer } from '#app/components/viewer';
import { apiBaseUrl } from '#app/constants';
import { useAuthInfo } from '#app/stores/auth-info';
import { setCustomError } from '#app/utils/set-custom-error';

const ReservedRouteCreator = () => {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>();
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState(null);

  const [result, setResult] = useState<boolean>(false);
  const [response, setResponse] = useState<any>(null);
  const authInfo = useLatest(useAuthInfo((s) => s.authInfo));

  const handleClear = () => {
    setJsonData(null);
    setError(null);
    setResult(false);
    setResponse(null);
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          try {
            const parsedData = JSON.parse(result);
            if (validateSchema(parsedData)) {
              setJsonData(parsedData);
              setError(null);
            } else {
              setError('Invalid JSON structure.');
              setJsonData(null);
            }
          } catch (err) {
            setError('Invalid JSON format.');
            setJsonData(null);
          }
        } else {
          setError('Error reading file as text.');
        }
      };
      reader.readAsText(file);
    } else {
      setError('Please upload a valid JSON file.');
    }
  };

  const validateSchema = (data: any) => {
    if (!data.area || !Array.isArray(data.area)) return false;
    for (const areaItem of data.area) {
      if (!areaItem.reservationTime || !areaItem.voxelValues) return false;
      if (!areaItem.reservationTime.period || !areaItem.reservationTime.occupation) return false;
      if (!Array.isArray(areaItem.voxelValues)) return false;
      for (const voxel of areaItem.voxelValues) {
        if (!voxel.id || !voxel.id.ID || !voxel.reservationTime || !voxel.reservationTime.period)
          return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    setResult(null);
    if (!jsonData) {
      setError('No valid JSON data to submit.');
      return;
    }
    try {
      const response = await createReservedRoute({
        baseUrl: apiBaseUrl,
        authInfo: authInfo.current,
        payload: jsonData,
      });
      setResponse(response);
      setResult(true);
    } catch (error) {
      setCustomError(error);
      setError('Failed to register.');
      setResult(false);
    }
  };

  return (
    <>
      <Head>
        <title>予約ルート生成</title>
      </Head>
      <ViewerContainer>
        <Viewer ref={viewerRef}></Viewer>
      </ViewerContainer>
      <Navigation>
        {result == null ? (
          <p key={`p1`}>登録しています...</p>
        ) : (
          <div>
            {result && <p key={`p2`}>登録が正常に完了しました。</p>}
            {response && response.objectId && <p>登録された ID: {response.objectId}</p>}
            <input type="file" accept="application/json" onChange={handleFileChange} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <br />
            <br />
            <NavigationButtons>
              {!result && (
                <Button onClick={handleSubmit} disabled={!jsonData}>
                  レジスター
                </Button>
              )}
              <Button onClick={handleClear}>クリア</Button>
            </NavigationButtons>
          </div>
        )}
      </Navigation>
    </>
  );
};

export default WithAuthGuard(ReservedRouteCreator);
