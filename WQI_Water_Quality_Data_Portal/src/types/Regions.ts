import EsriDESConfig from 'app/components/esri/appConfig';

interface RegionAttributesResponse {
  attributes: RegionAttributes;
}

interface RegionAttributes {
  OBJECTID: number;
  NRM_Region: string;
  Area_KM2: GLfloat;
  Area_Ha: GLfloat;
  Area_check: string;
  km2: number;
  Shape__Area: GLfloat;
  Shape__Length: GLfloat;
  Reg_Order: GLfloat;
}

export interface RegionsListResponseItem {
  features: RegionAttributesResponse[];
}

export interface Regions extends RegionAttributes {}

export function isRegions(item: any): item is Regions[] {
  return (
    typeof item[0] === 'object' &&
    EsriDESConfig.FeatureLayers.regions.UniqueColumnName in item[0]
  );
}
