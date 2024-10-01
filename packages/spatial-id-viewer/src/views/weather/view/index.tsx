import { Cesium3DTileStyle, Viewer } from 'cesium';
import { RangeSlider } from 'flowbite-react';
import Head from 'next/head';
import { ChangeEvent, useEffect, useState } from 'react';
import { CesiumComponentRef } from 'resium';

import { RequestTypes } from 'spatial-id-svc-common';

import { createUseModels } from '#app/components/area-viewer';
import { WithAuthGuard } from '#app/components/auth-guard';
import { TabAreaViewer } from '#app/components/tab-area-viewer';
import { WeatherSettings } from '#app/views/weather/view/fragments/weather-setting';
import {
  useDeleteModel,
  useLoadModel,
  useLoadModels,
} from '#app/views/weather/view/hooks/load-models';

interface Props {
  reference: React.RefObject<CesiumComponentRef<Viewer>>;
}
const CurrentWeatherViewer = (props: Props) => {
  const [type, setType] = useState<string>('windDirection');
  const [tilesetStyle, setTilesetStyle] = useState<Cesium3DTileStyle>();
  const [tileOpacity, setTileOpacity] = useState(0.6);

  const loadModel = useLoadModel('weather');
  const loadModels = useLoadModels('weather');
  const deleteModel = useDeleteModel();

  const onTileOpacityChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setTileOpacity(ev.target.valueAsNumber);
  };

  useEffect(() => {
    setTilesetStyle(tilesetStyleFn(tileOpacity, type));
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
        requestType={RequestTypes.WEATHER}
        reference={props.reference}
      >
        <input
          type="range"
          className="h-1 accent-yellow-500"
          value={tileOpacity}
          onChange={onTileOpacityChange}
          min={0}
          max={1}
          step={0.01}
        />
        <WeatherSettings setType={setType} />
      </TabAreaViewer>
    </>
  );
};

const tilesetStyleFn = (tileOpacity: number, type: string) =>
  new Cesium3DTileStyle({
    color: `hsla((1 - log(clamp(\${feature["${type}"]}, 1, 100)) / log(100)) * 2 / 3, 1, 0.6, ${tileOpacity})`,
  });

export default WithAuthGuard(CurrentWeatherViewer);
