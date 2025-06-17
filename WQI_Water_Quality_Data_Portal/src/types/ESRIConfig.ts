export default interface EsriDESConfigInterface {
  PortalToken: string;
  WebMap: string;
  FeatureLayers: FeatureLayerItem;
  Tables: TableItem;
  RegionsOrderField: string;
  AnalytesOrderField: string;
  UniqueAnalyteGroup: string;
  QueryParamsAll: string;
  QueryParamsNoWhere: string;
  QueryInternalSitesOIDs: string;
  DatePickerOptions: DatePickerOptions;
  DownloadLimit: number;
}

type DatePickerOptions = {
  Everything: number;
  YearsRange: number;
  DateRange: number;
};
type FeatureLayerItem = {
  sites: TableData;
  regions: TableData;
  basins: TableData;
};
type TableData = {
  url: string;
  UniqueColumnName: string;
  QueryOutputFields: string[];
  YearsRangeColumnName: string | null;
  DateColumnName: string | null;
  AnalyteColumnName: string | null;
  QueryOrderFields: string[];
};
type TableItem = {
  Analytes: TableData;
  AnnualLoad: TableData;
  AnnualFlow: TableData;
  AnnualConcentration: TableData;
  DailyLoad: TableData;
  PRMDaily: TableData;
  PRMWetSeason: TableData;
  Concentration: TableData;
  AnalytesOrder: TableData;
};
