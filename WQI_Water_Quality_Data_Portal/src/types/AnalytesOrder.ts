import EsriDESConfig from 'app/components/esri/appConfig';

interface AnalytesOrderAttributesResponse {
  attributes: AnalytesOrderAttributes;
}

interface AnalytesOrderAttributes {
  primary_analyte_group: string;
  analyte_order: number;
  ObjectId: number;
}

export interface AnalytesOrdersListResponseItem {
  features: AnalytesOrderAttributesResponse[];
}

export interface AnalytesOrders extends AnalytesOrderAttributes {}

export function isAnalytesOrders(item: any): item is AnalytesOrders[] {
  return (
    typeof item[0] === 'object' &&
    EsriDESConfig.Tables.AnalytesOrder.UniqueColumnName in item[0]
  );
}
