import { SpatialId } from 'spatial-id-converter';

interface tubeStartEnd {
  latitude: number;
  longitude: number;
  altitude: number;
  altitudeAttribute: string;
}

export const createFigure = (
  spatialId: SpatialId,
  tubeStart: tubeStartEnd,
  tubeEnd: tubeStartEnd,
  radian: number,
  polygon: any
) => {
  const figure = {
    identification: {
      ID: spatialId,
    },
    tube: {
      start: tubeStart,
      end: tubeEnd,
      radian: radian,
    },
    polygon: polygon,
  };

  return figure;
};
