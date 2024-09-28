import { Cesium3DTileStyle, Viewer } from 'cesium';
import { RangeSlider } from 'flowbite-react';
import Head from 'next/head';
import { ChangeEvent, useEffect, useState } from 'react';
import { CesiumComponentRef } from 'resium';

import { RequestTypes } from 'spatial-id-svc-common';

import { createUseModels } from '#app/components/area-viewer';
import { WithAuthGuard } from '#app/components/auth-guard';
import { TabAreaViewer } from '#app/components/tab-area-viewer';
import {
  useDeleteModel,
  useLoadModel,
  useLoadModels,
} from '#app/views/weather/view/hooks/load-models';
import { WeatherForecastSettings } from '#app/views/WeatherForecast/view/fragments/weather-forecast-setting';

interface Props {
  reference: React.RefObject<CesiumComponentRef<Viewer>>;
}
const WeatherForecastViewer = (props: Props) => {
  const [type, setType] = useState<string>('windDirection');
  const [tilesetStyle, setTilesetStyle] = useState<Cesium3DTileStyle>();
  const [tileOpacity, setTileOpacity] = useState(0.6);

  const loadModel = useLoadModel('weatherForecast');
  const loadModels = useLoadModels('weatherForecast');
  const deleteModel = useDeleteModel();

  const onTileOpacityChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setTileOpacity(ev.target.valueAsNumber);
  };

  useEffect(() => {
    setTilesetStyle(tilesetStyleFn(tileOpacity, type));
    console.log(tilesetStyleFn(tileOpacity, type));
  }, [tileOpacity, type]);

  const useModels = createUseModels({
    loadModel,
    loadModels,
    deleteModel,
  });

  return (
    <>
      <Head>
        <title>天気情報の表示・削除</title>
      </Head>
      <TabAreaViewer
        featureName="気象情報"
        useModels={useModels}
        tilesetStyle={tilesetStyle}
        requestType={RequestTypes.WEATHER_FORECAST}
        reference={props.reference}
      >
        <RangeSlider
          className="dark"
          sizing="sm"
          value={tileOpacity}
          onChange={onTileOpacityChange}
          min={0}
          max={1}
          step={0.01}
        />
        <WeatherForecastSettings setType={setType} />
      </TabAreaViewer>
    </>
  );
};

const tilesetStyleFn = (tileOpacity: number, type: string) =>
  new Cesium3DTileStyle({
    color: `hsla((1 - log(clamp(\${feature["${type}"]}, 1, 100)) / log(100)) * 2 / 3, 1, 0.6, ${tileOpacity})`,
  });

export default WithAuthGuard(WeatherForecastViewer);
