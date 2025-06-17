import EsriDESConfig from 'app/components/esri/appConfig';

interface ConcentrationAttributesResponse {
  attributes: ConcentrationAttributes;
}

interface ConcentrationAttributes {
  Site_Code: string;
  Site_Name: string;
  Latitude: GLfloat;
  Longitude: GLfloat;
  Datum: string;
  Basin: string;
  Region: string;
  Catchment: string;
  Site_Owner: string;
  Sample_Reference: number;
  Date_Time: string;
  Date__YYYY_YYYY_: string;
  Collection_Method: string;
  Depth__m_: GLfloat;
  Laboratory: string;
  Analysis_Method: string;
  Analyte_Group: string;
  Analyte: string;
  Unit: string;
  Operator: string;
  Value: GLfloat;
  Quality_Code: number;
  Comment: string;
  Project_Name: string;
  Project_Description: string;
  Data_Source: string;
  ObjectId: number;
}

export interface ConcentrationsListResponseItem {
  features: ConcentrationAttributesResponse[];
}

export interface ConcentrationReport extends ConcentrationAttributes {}

export function isConcentration(item: any): item is ConcentrationReport[] {
  return EsriDESConfig.Tables.Concentration.UniqueColumnName in item[0];
}
