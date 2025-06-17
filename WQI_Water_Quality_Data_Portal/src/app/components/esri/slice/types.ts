import MapView from '@arcgis/core/views/MapView';
import { Analytes } from 'types/Analytes';
import { AnnualLoadReport } from 'types/AnnualLoadReport';
import { AnnualFlowReport } from 'types/AnnualFlowReport';
import { AnnualConcentrationReport } from 'types/AnnualConcentrationReport';
import { Basins } from 'types/Basins';
import { ConcentrationReport } from 'types/ConcentrationReport';
import { DailyLoadReport } from 'types/DailyLoadReport';
import { PRMReport } from 'types/PRMReport';
import { Regions } from 'types/Regions';
import { Sites } from 'types/Sites';
import { ReportsData } from '../../../../types/ReportsData';
import { AnalytesOrders } from 'types/AnalytesOrder';

export interface ESRIDataState {
  analytes: Analytes[];
  analytesOrderTable: AnalytesOrders[];
  sites: Sites[];
  basins: Basins[];
  regions: Regions[];
  concentration: ConcentrationReport[];
  dailyLoad: DailyLoadReport[];
  annualLoad: AnnualLoadReport[];
  annualFlow: AnnualFlowReport[];
  annualConcentration: AnnualConcentrationReport[];
  dailyPRM: PRMReport[];
  wetPRM: PRMReport[];
  internalSitesOIDs: number[];
  includeExternalDataFlag: boolean;
  selectedRegion: string | null;
  selectedSites: Array<string>;
  selectedSiteCodes: Array<string>;
  selectedAnalytes: Array<string>;
  selectedDateOption: number;
  selectedYearsRange: string[];
  selectedDateRange: Date[];
  reportsData: ReportsData | null;
  analytePerGroupObj: Object | {};
  reportsState: HTMLCalciteCheckboxElement[];
  availableYearsRange: string[];
  pesticidesAnalyteChoice: boolean;
  downloadBtn: HTMLCalciteButtonElement | null;
  map: MapView | null;
  mapFullyLoaded: boolean;
  datesOptionsVal: [string, any];
  choiceCleanerBtnSites: HTMLCalciteButtonElement | null;
  choiceCleanerBtnAnalytes: HTMLCalciteButtonElement | null;
  layersLoadedFlag: boolean;
  locationsTree: HTMLCalciteTreeElement | null;
  initialExtent: HashMap<any> | null;
  calcLoadFlag: boolean;
}

export const enum DataErrorType {
  RESPONSE_ERROR = 1,
  NO_RECORDS = 2,
}

/* 
  If you want to use 'ContainerState' keyword everywhere in your feature folder, 
  instead of the 'HomePageState' keyword.
*/
export type ContainerState = ESRIDataState;
