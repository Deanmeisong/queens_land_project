import EsriDESConfig from 'app/components/esri/appConfig';

interface SiteAttributesResponse {
  attributes: SiteAttributes;
}

interface SiteAttributes {
  Site_Code: string;
  Site_Name: string;
  Site_Owner: string;
  Region: string;
  Basin_Code: number;
  Basin: string;
  Latitude: GLfloat;
  Longitude: GLfloat;
  Datum: string;
  Catchment: string;
  ObjectId: number;
}

export interface SitesListResponseItem {
  features: SiteAttributesResponse[];
  objectIds: number[];
}

export interface Sites extends SiteAttributes {}

export function isSites(item: any): item is Sites[] {
  return (
    typeof item[0] === 'object' &&
    EsriDESConfig.FeatureLayers.sites.UniqueColumnName in item[0]
  );
}
