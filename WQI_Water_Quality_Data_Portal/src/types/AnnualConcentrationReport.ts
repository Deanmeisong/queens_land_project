import EsriDESConfig from 'app/components/esri/appConfig';

interface AnnualConcentrationReportAttributesResponse {
  attributes: AnnualConcentrationReportAttributes;
}

interface AnnualConcentrationReportAttributes {
  Site_Code: string;
  Analyte: string;
  Sample_Reference: string;
  Date__YYYY_YYYY_: string;
  Date_Time: string;
  Operator: string;
  Value__mg_per_L_: GLfloat;
  Quality_Code: string;
  ObjectId: number;
}

export interface AnnualConcentrationReportsListResponseItem {
  features: AnnualConcentrationReportAttributesResponse[];
}

export interface AnnualConcentrationReport
  extends AnnualConcentrationReportAttributes {}

export function isAnnualConcentrationReport(
  item: any,
): item is AnnualConcentrationReport[] {
  return EsriDESConfig.Tables.AnnualConcentration.UniqueColumnName in item[0];
}
