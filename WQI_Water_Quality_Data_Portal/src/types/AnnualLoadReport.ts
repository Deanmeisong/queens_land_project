import EsriDESConfig from 'app/components/esri/appConfig';

interface AnnualLoadReportAttributesResponse {
  attributes: AnnualLoadReportAttributes;
}

interface AnnualLoadReportAttributes {
  Site_Code: string;
  Site_Name: string;
  Latitude: GLfloat;
  Longitude: GLfloat;
  Datum: string;
  Basin: string;
  Region: string;
  Catchment: string;
  Monitored_area__Km2_: GLfloat;
  Calculation_Method: string;
  Number_of_Samples: number;
  Date__YYYY_YYYY_: string;
  Analyte: string;
  Unit: string;
  Load__t_: GLfloat;
  Yield__kg_km2_: GLfloat;
  Discharge__ML_: GLfloat;
  Flow_Measured____: GLfloat;
  Flow_Modelled____: GLfloat;
  Flow_Unknown____: GLfloat;
  Data_Source: string;
  ObjectId: number;
}

export interface AnnualLoadReportsListResponseItem {
  features: AnnualLoadReportAttributesResponse[];
}

export interface AnnualLoadReport extends AnnualLoadReportAttributes {}

export function isAnnualLoadReport(item: any): item is AnnualLoadReport[] {
  return EsriDESConfig.Tables.AnnualLoad.UniqueColumnName in item[0];
}
