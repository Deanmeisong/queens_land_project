import EsriDESConfig from 'app/components/esri/appConfig';

interface BasinAttributesResponse {
  attributes: BasinAttributes;
}

interface BasinAttributes {
  OBJECTID: number;
  OID_BASINS: number;
  NRM_Region: string;
  RepReg: string;
  Area_km2_c: number;
  Shape__Area: GLfloat;
  Shape__Length: GLfloat;
}

export interface BasinsListResponseItem {
  features: BasinAttributesResponse[];
}

export interface Basins extends BasinAttributes {}

export function isBasins(item: any): item is Basins[] {
  return (
    typeof item[0] === 'object' &&
    EsriDESConfig.FeatureLayers.basins.UniqueColumnName in item[0]
  );
}
