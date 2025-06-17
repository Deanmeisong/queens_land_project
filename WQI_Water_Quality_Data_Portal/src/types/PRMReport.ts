import EsriDESConfig from 'app/components/esri/appConfig';

interface PRMReportAttributesResponse {
  attributes: PRMReportAttributes;
}

interface PRMReportAttributes {
  Site_Code: string;
  Site_Name: string;
  Latitude: GLfloat;
  Longitude: GLfloat;
  Datum: string;
  Basin: string;
  Region: string;
  Catchment: string;
  Number_of_Pesticides_included: number;
  Date__YYYY_YYYY_: string;
  Species_Protected____: GLfloat;
  Risk: string;
  Status: number;
  Data_Source: string;
  ObjectId: number;
}

export interface PRMReportsListResponseItem {
  features: PRMReportAttributesResponse[];
}

export interface PRMReport extends PRMReportAttributes {}

export function isPRMReport(item: any): item is PRMReport[] {
  return EsriDESConfig.Tables.PRMDaily.UniqueColumnName in item[0];
}
