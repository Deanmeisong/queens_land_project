import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { esriDataFetchSaga } from './saga';
import { ESRIDataState } from './types';
import { Sites, isSites } from 'types/Sites';
import { Basins, isBasins } from 'types/Basins';
import { Regions, isRegions } from 'types/Regions';
import { Analytes, isAnalytes } from 'types/Analytes';
import { AnalytesOrders, isAnalytesOrders } from 'types/AnalytesOrder';

// TODO: Replace all NODES/unserialized states with selection choice (see configstore)
export const initialState: ESRIDataState = {
  sites: [],
  basins: [],
  regions: [],
  concentration: [],
  dailyLoad: [],
  analytes: [],
  analytesOrderTable: [],
  annualLoad: [],
  annualFlow: [],
  annualConcentration: [],
  dailyPRM: [],
  wetPRM: [],
  includeExternalDataFlag: false,
  locationsTree: null,
  initialExtent: null,
  internalSitesOIDs: [],
  selectedRegion: null,
  selectedSites: [],
  selectedSiteCodes: [],
  selectedAnalytes: [],
  selectedDateOption: 10,
  selectedYearsRange: [],
  selectedDateRange: [],
  availableYearsRange: [],
  datesOptionsVal: ['', {}],
  reportsData: null,
  pesticidesAnalyteChoice: false,
  analytePerGroupObj: {},
  reportsState: [],
  downloadBtn: null,
  choiceCleanerBtnSites: null,
  choiceCleanerBtnAnalytes: null,
  map: null,
  mapFullyLoaded: false,
  layersLoadedFlag: false,
  calcLoadFlag: false,
};

const slice = createSlice({
  name: 'esriData',
  initialState,
  reducers: {
    // ACTION ON THE STORE DATA (ACTIONS)
    // fetchSites(state, action: PayloadAction<Sites[]>) {
    //   state.sites = action.payload;
    // },
    // LOADING INDICATOR/SETTER
    mapLoaded(state, action) {
      const map = action.payload;
      state.map = map;
      state.mapFullyLoaded = true;
    },
    loadSites(state) {
      state.sites = [];
    },
    loadReportsData(state) {
      state.reportsData = {
        Concentrations: {
          sites: 0,
          results: 0,
          id: 'concentration',
          label: 'Concentration',
        },
        DailyLoad: {
          sites: 0,
          results: 0,
          label: 'Daily load',
          id: 'daily load',
        },
        AnnualLoad: {
          sites: 0,
          results: 0,
          label: 'Annual load/yield',
          id: 'annual load',
        },
        // AnnualFlow: {
        //   sites: 0,
        //   results: 0,
        //   label: 'Annual flow',
        //   id: 'annual flow',
        // },
        // AnnualConcentration: {
        //   sites: 0,
        //   results: 0,
        //   label: 'Annual concentration',
        //   id: 'annual concentration',
        // },
        DailyPRM: {
          sites: 0,
          results: 0,
          label: 'Daily Pesticide Risk Metric',
          id: 'daily pesticide',
        },
        AnnualPRM: {
          sites: 0,
          results: 0,
          label: 'Wet season Pesticide Risk Metric',
          id: 'wet season',
        },
      };
    },
    loadLocationsTree(state) {
      state.locationsTree = null;
    },
    loadLayersFlag(state) {
      state.layersLoadedFlag = false;
    },
    loadCalcLoadFlag(state) {
      state.calcLoadFlag = false;
    },
    setAvailableYearsRange(state, action) {
      state.availableYearsRange = action.payload;
    },
    loadReportsState(state) {
      state.reportsState = [];
    },
    loadBasins(state) {
      state.basins = [];
    },
    loadRegions(state) {
      state.regions = [];
    },
    loadAnalytesOrderTable(state) {
      state.analytesOrderTable = [];
    },
    calculateReportCards(state) {
      state.reportsData = null;
    },
    loadInternalSitesOIDs(state) {
      state.internalSitesOIDs = [];
    },
    loadConcentration(state) {
      state.concentration = [];
    },
    loadAnalytes(state) {
      state.analytes = [];
    },
    loadDailyLoad(state) {
      state.dailyLoad = [];
    },
    loadDownloadBtn(state) {
      state.downloadBtn = null;
    },
    setDownloadBtn(state, action) {
      state.downloadBtn = action.payload;
    },
    setDatesOptionsVal(state, action) {
      state.datesOptionsVal = action.payload;
    },
    setSelectedDateOption(state, action) {
      state.selectedDateOption = action.payload;
    },
    setSelectedYearsRangeOption(state, action) {
      state.selectedYearsRange = action.payload;
    },
    setSelectedDateRangeOption(state, action) {
      state.selectedDateRange = action.payload;
    },
    loadChoiceCleanerBtnSites(state) {
      state.choiceCleanerBtnSites = null;
    },
    loadChoiceCleanerBtnAnalytes(state) {
      state.choiceCleanerBtnAnalytes = null;
    },
    setInternalDataFlag(state, action) {
      state.includeExternalDataFlag = action.payload;
    },
    setPesticidesAnalyteChoice(state, action) {
      state.pesticidesAnalyteChoice = action.payload;
    },
    setChoiceCleanerSites(state, action) {
      state.choiceCleanerBtnSites = action.payload;
    },
    setChoiceCleanerAnalytes(state, action) {
      state.choiceCleanerBtnAnalytes = action.payload;
    },
    setReportsState(state, action) {
      state.reportsState = action.payload;
    },
    setReportsData(state, action) {
      state.reportsData = action.payload;
    },
    setLayersLoadedFlag(state, action) {
      state.layersLoadedFlag = action.payload;
    },
    setCalcLoadFlag(state, action) {
      state.calcLoadFlag = action.payload;
    },
    setAnalytePerGroupObj(state, action) {
      state.analytePerGroupObj = action.payload;
    },
    setSelectedRegion(state, action) {
      state.selectedRegion = action.payload;
    },
    setSelectedSites(state, action) {
      state.selectedSites = action.payload;
    },
    setSelectedSiteCodes(state, action) {
      state.selectedSiteCodes = action.payload;
    },
    setSelectedAnalytes(state, action) {
      state.selectedAnalytes = action.payload;
    },
    setLocationsTree(state, action) {
      state.locationsTree = action.payload;
    },
    setInitialExtent(state, action) {
      state.initialExtent = action.payload;
    },
    loadAnnualLoad(state) {
      state.annualLoad = [];
    },
    loadAnnualFlow(state) {
      state.annualFlow = [];
    },
    loadAnnualConcentration(state) {
      state.annualConcentration = [];
    },
    dataLoaded(
      state,
      action: PayloadAction<
        | Sites[]
        | Basins[]
        | Regions[]
        | Analytes[]
        | number[]
        | AnalytesOrders[]
      >,
    ) {
      const data = action.payload;
      if (isSites(data)) {
        state.sites = data;
      } else if (isBasins(data)) {
        state.basins = data;
      } else if (isRegions(data)) {
        state.regions = data;
      } else if (isAnalytes(data)) {
        state.analytes = data;
      } else if (isAnalytesOrders(data)) {
        state.analytesOrderTable = data;
      } else if (typeof data[0] === 'number') {
        state.internalSitesOIDs = data;
      }
    },
  },
});

export const { actions: esriDataActions, reducer } = slice;

export const useESRIDataSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: esriDataFetchSaga });
  return { actions: slice.actions };
};
