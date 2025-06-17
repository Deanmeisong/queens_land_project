import EsriDESConfig from 'app/components/esri/appConfig';

interface AnnualFlowReportAttributesResponse {
  attributes: AnnualFlowReportAttributes;
}

interface AnnualFlowReportAttributes {
  Site_Code: string;
  Date__YYYY_YYYY_: string;
  Date_Time: string;
  Quality_Code: string;
  Flow_Cumecs: string;
  ObjectId: number;
}

export interface AnnualLoadReportsListResponseItem {
  features: AnnualFlowReportAttributesResponse[];
}

export interface AnnualFlowReport extends AnnualFlowReportAttributes {}

export function isAnnualFlowReport(item: any): item is AnnualFlowReport[] {
  return EsriDESConfig.Tables.AnnualFlow.UniqueColumnName in item[0];
}
