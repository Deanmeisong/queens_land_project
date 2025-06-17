import EsriDESConfig from 'app/components/esri/appConfig';

interface AnalyteAttributesResponse {
  attributes: AnalyteAttributes;
}

interface AnalyteAttributes {
  primary_analyte_group: string;
  secondary_analyte_group: string;
  generic_name: string;
  unit: string;
  ObjectId: number;
}

export interface AnalytesListResponseItem {
  features: AnalyteAttributesResponse[];
}

export interface Analytes extends AnalyteAttributes {}

export function isAnalytes(item: any): item is Analytes[] {
  return (
    typeof item[0] === 'object' &&
    EsriDESConfig.Tables.Analytes.UniqueColumnName in item[0] &&
    !(EsriDESConfig.Tables.AnalytesOrder.UniqueColumnName in item[0])
  );
}
