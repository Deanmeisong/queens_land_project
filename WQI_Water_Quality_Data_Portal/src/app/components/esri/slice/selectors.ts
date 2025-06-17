import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from '.';

// First select the relevant part from the state
const selectDomain = (state: RootState) => state.esriData || initialState;

// FETCH THE DATA FROM THE STORE (SELECTOR)
export const selectSites = createSelector(
  [selectDomain],
  esriDataState => esriDataState.sites,
);

export const selectAnalytes = createSelector(
  [selectDomain],
  esriDataState => esriDataState.analytes,
);

export const selectInternalSitesOIDs = createSelector(
  [selectDomain],
  esriDataState => esriDataState.internalSitesOIDs,
);

export const selectChosenYearsRange = createSelector(
  [selectDomain],
  esriDataState => esriDataState.selectedYearsRange,
);

export const selectChosenDateOption = createSelector(
  [selectDomain],
  esriDataState => esriDataState.selectedDateOption,
);

export const selectChosenDateRange = createSelector(
  [selectDomain],
  esriDataState => esriDataState.selectedDateRange,
);

export const selectAvailableYearsRange = createSelector(
  [selectDomain],
  esriDataState => esriDataState.availableYearsRange,
);

export const selectLayersLoadedFlag = createSelector(
  [selectDomain],
  esriDataState => esriDataState.layersLoadedFlag,
);

export const selectCalcLoadFlag = createSelector(
  [selectDomain],
  esriDataState => esriDataState.calcLoadFlag,
);

export const selectDownloadBtn = createSelector(
  [selectDomain],
  esriDataState => esriDataState.downloadBtn,
);

export const selectBasins = createSelector(
  [selectDomain],
  esriDataState => esriDataState.basins,
);

export const selectLocationsTree = createSelector(
  [selectDomain],
  esriDataState => esriDataState.locationsTree,
);

export const selectReportsArray = createSelector(
  [selectDomain],
  esriDataState => esriDataState.reportsState,
);

export const selectExternalDataFlag = createSelector(
  [selectDomain],
  esriDataState => esriDataState.includeExternalDataFlag,
);

export const selectMap = createSelector(
  [selectDomain],
  esriDataState => esriDataState.map,
);

export const selectRegions = createSelector(
  [selectDomain],
  esriDataState => esriDataState.regions,
);

export const selectAnalytesOrderTable = createSelector(
  [selectDomain],
  esriDataState => esriDataState.analytesOrderTable,
);

export const selectActiveRegion = createSelector(
  [selectDomain],
  esriDataState => esriDataState.selectedRegion,
);

export const selectChosenSites = createSelector(
  [selectDomain],
  esriDataState => esriDataState.selectedSites,
);

export const selectChosenSiteCodes = createSelector(
  [selectDomain],
  esriDataState => esriDataState.selectedSiteCodes,
);

export const selectReportsData = createSelector(
  [selectDomain],
  esriDataState => esriDataState.reportsData,
);

export const selectChosenAnalytes = createSelector(
  [selectDomain],
  esriDataState => esriDataState.selectedAnalytes,
);

export const selectMapLoadFlag = createSelector(
  [selectDomain],
  esriDataState => esriDataState.mapFullyLoaded,
);

export const selectAnalytePerGroupObj = createSelector(
  [selectDomain],
  esriDataState => esriDataState.analytePerGroupObj,
);

export const selectPesticidesAnalyteChoiceFlag = createSelector(
  [selectDomain],
  esriDataState => esriDataState.pesticidesAnalyteChoice,
);

export const selectChoiceCleanerBtnAnalytes = createSelector(
  [selectDomain],
  esriDataState => esriDataState.choiceCleanerBtnAnalytes,
);

export const selectDateOptionVal = createSelector(
  [selectDomain],
  esriDataState => esriDataState.datesOptionsVal![0],
);

export const setDateOptionVal = createSelector(
  [selectDomain],
  esriDataState => esriDataState.datesOptionsVal![1],
);

export const selectChoiceCleanerBtnSites = createSelector(
  [selectDomain],
  esriDataState => esriDataState.choiceCleanerBtnSites,
);

export const selectInitExtent = createSelector(
  [selectDomain],
  esriDataState => esriDataState.initialExtent,
);
