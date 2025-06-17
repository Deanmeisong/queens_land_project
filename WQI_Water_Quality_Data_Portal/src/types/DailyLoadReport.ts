import EsriDESConfig from 'app/components/esri/appConfig';

interface DailyLoadReportAttributesResponse {
  attributes: DailyLoadReportAttributes;
}

interface DailyLoadReportAttributes {
  Site_Code: string;
  Site_Name: string;
  Latitude: GLfloat;
  Longitude: GLfloat;
  Datum: string;
  Basin: string;
  Region: string;
  Catchment: string;
  Calculation_Method: string;
  Date: string;
  Date__YYYY_YYYY_: string;
  Analyte: string;
  Unit: string;
  Load__t_: GLfloat;
  Data_Source: string;
  ObjectId: number;
}

export interface DailyLoadReportsListResponseItem {
  features: DailyLoadReportAttributesResponse[];
}

export interface DailyLoadReport extends DailyLoadReportAttributes {}

export function isDailyLoadReport(item: any): item is DailyLoadReport[] {
  return EsriDESConfig.Tables.DailyLoad.UniqueColumnName in item[0];
}
