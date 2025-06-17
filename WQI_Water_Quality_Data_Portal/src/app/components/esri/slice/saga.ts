import { call, put, takeLatest, delay, select } from 'redux-saga/effects';
import { request } from 'utils/request';
import { esriDataActions as actions } from '.';
import { Sites, SitesListResponseItem } from 'types/Sites';
import { DataErrorType } from './types';
import EsriDESConfig from '../appConfig';
import * as query from '@arcgis/core/rest/query.js';
import { ReportsData } from '../../../../types/ReportsData';
import {
  selectChosenAnalytes,
  selectChosenDateOption,
  selectChosenDateRange,
  selectChosenSiteCodes,
  selectChosenSites,
  selectChosenYearsRange,
  selectMapLoadFlag,
  selectPesticidesAnalyteChoiceFlag,
  selectReportsArray,
} from './selectors';

export function* fetchSitesOIDs() {
  const selectedSites = yield select(selectChosenSites);
  if (
    selectedSites &&
    selectedSites.filter(s => s.includes('site_')).length > 0
  ) {
    const sitesOIDs = selectedSites
      .filter(s => s.includes('site_'))
      .map(s => Number(s.replaceAll('site_', '')));

    const selectedSiteCodes = yield call(getAllSiteCodes, sitesOIDs);
    const parsedSelectedSiteCodes = selectedSiteCodes.map(
      s => `'${s.attributes.Site_Code}'`,
    );
    yield put(actions.setSelectedSiteCodes(parsedSelectedSiteCodes));
  } else {
    yield put(actions.setSelectedSiteCodes([]));
  }
}

export function* loadAvailableYearsRange(reportIds) {
  const reportsToIterate = reportIds;
  const selectedSites = yield select(selectChosenSites);
  const sitesOID = selectedSites
    .filter(s => s.includes('site_'))
    .map(s => Number(s.replaceAll('site_', '')));

  if (selectedSites && selectedSites.length > 0) {
    let availableRange: Array<string> = [];
    const siteFeautres = yield call(getAllSiteCodes, sitesOID);
    const selectedSiteCodes = siteFeautres.map(
      (i: any) => `'${i.attributes.Site_Code}'`,
    );

    for (let i in reportsToIterate) {
      if (reportsToIterate[i].toLowerCase().includes('concentration')) {
        const queryResults = yield call(
          restURLQuery,
          EsriDESConfig.Tables.Concentration.url,
          `Site_Code in (${selectedSiteCodes.join(', ')})`,
          [EsriDESConfig.Tables.Concentration.YearsRangeColumnName],
          false,
          true,
        );
        const filteredValues: Array<string> = queryResults.map(
          (i: any) =>
            i.attributes[
              EsriDESConfig.Tables.Concentration.YearsRangeColumnName!
            ],
        );
        availableRange = Array.from(
          new Set(availableRange.concat(filteredValues)),
        );
      }

      if (reportsToIterate[i].toLowerCase().includes('daily pest')) {
        const queryResults = yield call(
          restURLQuery,
          EsriDESConfig.Tables.PRMDaily.url,
          `Site_code in (${selectedSiteCodes.join(', ')})`,
          [EsriDESConfig.Tables.PRMDaily.YearsRangeColumnName],
          false,
          true,
        );
        const filteredValues: Array<string> = queryResults.map(
          (i: any) =>
            i.attributes[EsriDESConfig.Tables.PRMDaily.YearsRangeColumnName!],
        );
        availableRange = Array.from(
          new Set(availableRange.concat(filteredValues)),
        );
      }

      if (reportsToIterate[i].toLowerCase().includes('wet season')) {
        const queryResults = yield call(
          restURLQuery,
          EsriDESConfig.Tables.PRMWetSeason.url,
          `Site_code in (${selectedSiteCodes.join(', ')})`,
          [EsriDESConfig.Tables.PRMWetSeason.YearsRangeColumnName],
          false,
          true,
        );
        const filteredValues: Array<string> = queryResults.map(
          (i: any) =>
            i.attributes[
              EsriDESConfig.Tables.PRMWetSeason.YearsRangeColumnName!
            ],
        );
        availableRange = Array.from(
          new Set(availableRange.concat(filteredValues)),
        );
      }

      if (reportsToIterate[i].toLowerCase().includes('daily load')) {
        const queryResults = yield call(
          restURLQuery,
          EsriDESConfig.Tables.DailyLoad.url,
          `Site_code in (${selectedSiteCodes.join(', ')})`,
          [EsriDESConfig.Tables.DailyLoad.YearsRangeColumnName],
          false,
          true,
        );
        const filteredValues: Array<string> = queryResults.map(
          (i: any) =>
            i.attributes[EsriDESConfig.Tables.DailyLoad.YearsRangeColumnName!],
        );
        availableRange = Array.from(
          new Set(availableRange.concat(filteredValues)),
        );
      }

      if (reportsToIterate[i].toLowerCase().includes('annual load')) {
        const queryResults = yield call(
          restURLQuery,
          EsriDESConfig.Tables.AnnualLoad.url,
          `Site_code in (${selectedSiteCodes.join(', ')})`,
          [EsriDESConfig.Tables.AnnualLoad.YearsRangeColumnName],
          false,
          true,
        );
        const filteredValues: Array<string> = queryResults
          .map(
            (i: any) =>
              i.attributes[
                EsriDESConfig.Tables.AnnualLoad.YearsRangeColumnName!
              ],
          )
          .filter(f => f);
        availableRange = Array.from(
          new Set(availableRange.concat(filteredValues)),
        );
      }

      yield put(actions.setAvailableYearsRange(availableRange));
    }
  } else {
    yield put(actions.setAvailableYearsRange([]));
  }
}

export function* calculateReportCards() {
  const selectMapStatus = yield select(selectMapLoadFlag);
  if (selectMapStatus) {
    const selectedSiteCodes = yield select(selectChosenSiteCodes);
    const pesticidesAnalyteChoiceFlag = yield select(
      selectPesticidesAnalyteChoiceFlag,
    );
    const selectedAnalytes = yield select(selectChosenAnalytes);
    const selectedDateOption = yield select(selectChosenDateOption);
    const selectedDateRange = yield select(selectChosenDateRange);
    const selectedYearsRange = yield select(selectChosenYearsRange);

    const where_sites = `Site_Code in (${
      selectedSiteCodes.length > 0 ? selectedSiteCodes.join(', ') : ''
    })`;

    const where_analytes =
      selectedAnalytes.length > 0
        ? `AND *PH-A* in (${selectedAnalytes.map(
            a => `'${a.replaceAll('analyte_', '').replaceAll("'", "''")}'`,
          )})`
        : '';

    const where_dates =
      selectedDateOption.toString() ===
        EsriDESConfig.DatePickerOptions.YearsRange.toString() &&
      selectedYearsRange.length > 0
        ? `AND *PH-D* in (${selectedYearsRange.map(
            dr => `'${dr.replaceAll(/\s+/g, '')}'`,
          )})`
        : selectedDateOption.toString() ===
            EsriDESConfig.DatePickerOptions.DateRange.toString() &&
          selectedDateRange.length > 1
        ? `AND *PH-D* BETWEEN '${
            selectedDateRange[0].getMonth() + 1
          }/${selectedDateRange[0].getDate()}/${selectedDateRange[0].getFullYear()}' AND  '${
            selectedDateRange[1].getMonth() + 1
          }/${selectedDateRange[1].getDate()}/${selectedDateRange[1].getFullYear()} 23:59:59'`
        : '';

    const customYearsRange: string[] =
      selectedDateRange.length > 1
        ? calcAnnualRangeFromDate(selectedDateRange[0], selectedDateRange[1])
        : [];
    const where_dates_annual_reports =
      selectedDateRange.length > 1 &&
      selectedDateOption.toString() ===
        EsriDESConfig.DatePickerOptions.DateRange.toString()
        ? `AND *PH-D* in (${customYearsRange.map(
            dr => `'${dr.replaceAll(/\s+/g, '')}'`,
          )})`
        : '';

    // Set calcLoadFlag to true, to mark the status that the data is being fetched now
    yield put(actions.setCalcLoadFlag(true));

    const concentrationSitesResults =
      selectedSiteCodes.length > 0
        ? yield call(
            restURLQuery,
            EsriDESConfig.Tables.Concentration.url,
            `${where_sites} ${where_dates} ${where_analytes}`
              .replaceAll(
                '*PH-A*',
                EsriDESConfig.Tables.Concentration.AnalyteColumnName || 'error',
              )
              .replaceAll(
                '*PH-D*',
                (selectedDateOption.toString() ===
                EsriDESConfig.DatePickerOptions.DateRange.toString()
                  ? EsriDESConfig.Tables.Concentration.DateColumnName
                  : selectedDateOption.toString() ===
                    EsriDESConfig.DatePickerOptions.YearsRange.toString()
                  ? EsriDESConfig.Tables.Concentration.YearsRangeColumnName
                  : '') || 'error',
              ),
            ['Site_Code'],
            true,
          )
        : 0;
    const concentrationSitesDistinct =
      selectedSiteCodes.length > 0
        ? yield call(
            restURLQuery,
            EsriDESConfig.Tables.Concentration.url,
            `${where_sites} ${where_dates} ${where_analytes}`
              .replaceAll(
                '*PH-A*',
                EsriDESConfig.Tables.Concentration.AnalyteColumnName || 'error',
              )
              .replaceAll(
                '*PH-D*',
                (selectedDateOption.toString() ===
                EsriDESConfig.DatePickerOptions.DateRange.toString()
                  ? EsriDESConfig.Tables.Concentration.DateColumnName
                  : selectedDateOption.toString() ===
                    EsriDESConfig.DatePickerOptions.YearsRange.toString()
                  ? EsriDESConfig.Tables.Concentration.YearsRangeColumnName
                  : '') || 'error',
              ),
            ['Site_Code'],
            true,
            true,
          )
        : 0;
    const dailyLoadSitesResults =
      selectedSiteCodes.length > 0
        ? yield call(
            restURLQuery,
            EsriDESConfig.Tables.DailyLoad.url,
            `${where_sites} ${where_dates} ${where_analytes}`
              .replaceAll(
                '*PH-A*',
                EsriDESConfig.Tables.DailyLoad.AnalyteColumnName || 'error',
              )
              .replaceAll(
                '*PH-D*',
                (selectedDateOption.toString() ===
                EsriDESConfig.DatePickerOptions.DateRange.toString()
                  ? EsriDESConfig.Tables.DailyLoad.DateColumnName
                  : selectedDateOption.toString() ===
                    EsriDESConfig.DatePickerOptions.YearsRange.toString()
                  ? EsriDESConfig.Tables.DailyLoad.YearsRangeColumnName
                  : '') || 'error',
              ),
            ['Site_Code'],
            true,
          )
        : 0;
    const dailyLoadSitesDistinct =
      selectedSiteCodes.length > 0
        ? yield call(
            restURLQuery,
            EsriDESConfig.Tables.DailyLoad.url,
            `${where_sites} ${where_dates} ${where_analytes}`
              .replaceAll(
                '*PH-A*',
                EsriDESConfig.Tables.DailyLoad.AnalyteColumnName || 'error',
              )
              .replaceAll(
                '*PH-D*',
                (selectedDateOption.toString() ===
                EsriDESConfig.DatePickerOptions.DateRange.toString()
                  ? EsriDESConfig.Tables.DailyLoad.DateColumnName
                  : selectedDateOption.toString() ===
                    EsriDESConfig.DatePickerOptions.YearsRange.toString()
                  ? EsriDESConfig.Tables.DailyLoad.YearsRangeColumnName
                  : '') || 'error',
              ),
            ['Site_Code'],
            true,
            true,
          )
        : 0;

    const annualLoadSitesResults =
      selectedSiteCodes.length > 0
        ? yield call(
            restURLQuery,
            EsriDESConfig.Tables.AnnualLoad.url,
            `${where_sites} ${
              selectedDateOption.toString() ===
              EsriDESConfig.DatePickerOptions.DateRange.toString()
                ? where_dates_annual_reports
                : selectedDateOption.toString() ===
                  EsriDESConfig.DatePickerOptions.YearsRange.toString()
                ? where_dates
                : ''
            } ${where_analytes}`
              .replaceAll(
                '*PH-A*',
                EsriDESConfig.Tables.AnnualLoad.AnalyteColumnName || 'error',
              )
              .replaceAll(
                '*PH-D*',
                EsriDESConfig.Tables.AnnualLoad.YearsRangeColumnName || 'error',
              ),
            ['Site_Code'],
            true,
          )
        : 0;

    const annualLoadSitesDistinct =
      selectedSiteCodes.length > 0
        ? yield call(
            restURLQuery,
            EsriDESConfig.Tables.AnnualLoad.url,
            `${where_sites} ${
              selectedDateOption.toString() ===
              EsriDESConfig.DatePickerOptions.DateRange.toString()
                ? where_dates_annual_reports
                : selectedDateOption.toString() ===
                  EsriDESConfig.DatePickerOptions.YearsRange.toString()
                ? where_dates
                : ''
            } ${where_analytes}`
              .replaceAll(
                '*PH-A*',
                EsriDESConfig.Tables.AnnualLoad.AnalyteColumnName || 'error',
              )
              .replaceAll(
                '*PH-D*',
                EsriDESConfig.Tables.AnnualLoad.YearsRangeColumnName || 'error',
              ),
            ['Site_Code'],
            true,
            true,
          )
        : 0;
    // const annualFlowSitesResults =
    //   selectedSiteCodes.length > 0
    //     ? yield call(
    //         restURLQuery,
    //         EsriDESConfig.Tables.AnnualFlow.url,
    //         `${where_sites} ${
    //           selectedDateOption.toString() ===
    //           EsriDESConfig.DatePickerOptions.DateRange.toString()
    //             ? where_dates_annual_reports
    //             : selectedDateOption.toString() ===
    //               EsriDESConfig.DatePickerOptions.YearsRange.toString()
    //             ? where_dates
    //             : ''
    //         } `.replaceAll(
    //           '*PH-D*',
    //           EsriDESConfig.Tables.AnnualFlow.YearsRangeColumnName || 'error',
    //         ),
    //         ['Site_Code'],
    //         true,
    //       )
    //     : 0;

    // const annualFlowSitesDistinct =
    //   selectedSiteCodes.length > 0
    //     ? yield call(
    //         restURLQuery,
    //         EsriDESConfig.Tables.AnnualFlow.url,
    //         `${where_sites} ${
    //           selectedDateOption.toString() ===
    //           EsriDESConfig.DatePickerOptions.DateRange.toString()
    //             ? where_dates_annual_reports
    //             : selectedDateOption.toString() ===
    //               EsriDESConfig.DatePickerOptions.YearsRange.toString()
    //             ? where_dates
    //             : ''
    //         } `.replaceAll(
    //           '*PH-D*',
    //           EsriDESConfig.Tables.AnnualFlow.YearsRangeColumnName || 'error',
    //         ),
    //         ['Site_Code'],
    //         true,
    //         true,
    //       )
    //     : 0;

    // const annualConcentrationSitesResults =
    //   selectedSiteCodes.length > 0
    //     ? yield call(
    //         restURLQuery,
    //         EsriDESConfig.Tables.AnnualConcentration.url,
    //         `${where_sites} ${
    //           selectedDateOption.toString() ===
    //           EsriDESConfig.DatePickerOptions.DateRange.toString()
    //             ? where_dates_annual_reports
    //             : selectedDateOption.toString() ===
    //               EsriDESConfig.DatePickerOptions.YearsRange.toString()
    //             ? where_dates
    //             : ''
    //         } ${where_analytes}`
    //           .replaceAll(
    //             '*PH-A*',
    //             EsriDESConfig.Tables.AnnualConcentration.AnalyteColumnName ||
    //               'error',
    //           )
    //           .replaceAll(
    //             '*PH-D*',
    //             EsriDESConfig.Tables.AnnualConcentration.YearsRangeColumnName ||
    //               'error',
    //           ),
    //         ['Site_Code'],
    //         true,
    //       )
    //     : 0;

    // const annualConcentrationSitesDistinct =
    //   selectedSiteCodes.length > 0
    //     ? yield call(
    //         restURLQuery,
    //         EsriDESConfig.Tables.AnnualConcentration.url,
    //         `${where_sites} ${
    //           selectedDateOption.toString() ===
    //           EsriDESConfig.DatePickerOptions.DateRange.toString()
    //             ? where_dates_annual_reports
    //             : selectedDateOption.toString() ===
    //               EsriDESConfig.DatePickerOptions.YearsRange.toString()
    //             ? where_dates
    //             : ''
    //         } ${where_analytes}`
    //           .replaceAll(
    //             '*PH-A*',
    //             EsriDESConfig.Tables.AnnualConcentration.AnalyteColumnName ||
    //               'error',
    //           )
    //           .replaceAll(
    //             '*PH-D*',
    //             EsriDESConfig.Tables.AnnualConcentration.YearsRangeColumnName ||
    //               'error',
    //           ),
    //         ['Site_Code'],
    //         true,
    //         true,
    //       )
    //     : 0;
    const PRMDailySitesResults =
      ((!pesticidesAnalyteChoiceFlag && selectedAnalytes.length <= 0) ||
        (selectedAnalytes.length > 0 && pesticidesAnalyteChoiceFlag)) &&
      selectedSiteCodes.length > 0
        ? yield call(
            restURLQuery,
            EsriDESConfig.Tables.PRMDaily.url,
            `${where_sites} ${where_dates}`.replaceAll(
              '*PH-D*',
              (selectedDateOption.toString() ===
              EsriDESConfig.DatePickerOptions.DateRange.toString()
                ? EsriDESConfig.Tables.PRMDaily.DateColumnName
                : selectedDateOption.toString() ===
                  EsriDESConfig.DatePickerOptions.YearsRange.toString()
                ? EsriDESConfig.Tables.PRMDaily.YearsRangeColumnName
                : '') || 'error',
            ),
            ['Site_Code'],
            true,
          )
        : 0;
    const PRMDailySitesDistinct =
      ((!pesticidesAnalyteChoiceFlag && selectedAnalytes.length <= 0) ||
        (selectedAnalytes.length > 0 && pesticidesAnalyteChoiceFlag)) &&
      selectedSiteCodes.length > 0
        ? yield call(
            restURLQuery,
            EsriDESConfig.Tables.PRMDaily.url,
            `${where_sites} ${where_dates}`.replaceAll(
              '*PH-D*',
              (selectedDateOption.toString() ===
              EsriDESConfig.DatePickerOptions.DateRange.toString()
                ? EsriDESConfig.Tables.PRMDaily.DateColumnName
                : selectedDateOption.toString() ===
                  EsriDESConfig.DatePickerOptions.YearsRange.toString()
                ? EsriDESConfig.Tables.PRMDaily.YearsRangeColumnName
                : '') || 'error',
            ),
            ['Site_Code'],
            true,
            true,
          )
        : 0;

    const PRMAnnualySitesResults =
      ((!pesticidesAnalyteChoiceFlag && selectedAnalytes.length <= 0) ||
        (selectedAnalytes.length > 0 && pesticidesAnalyteChoiceFlag)) &&
      selectedSiteCodes.length > 0
        ? yield call(
            restURLQuery,
            EsriDESConfig.Tables.PRMWetSeason.url,
            `${where_sites} ${
              selectedDateOption.toString() ===
              EsriDESConfig.DatePickerOptions.DateRange.toString()
                ? where_dates_annual_reports
                : selectedDateOption.toString() ===
                  EsriDESConfig.DatePickerOptions.YearsRange.toString()
                ? where_dates
                : ''
            }`.replaceAll(
              '*PH-D*',
              EsriDESConfig.Tables.PRMWetSeason.YearsRangeColumnName || 'error',
            ),
            ['Site_Code'],
            true,
          )
        : 0;

    const PRMAnnualySitesDistinct =
      ((!pesticidesAnalyteChoiceFlag && selectedAnalytes.length <= 0) ||
        (selectedAnalytes.length > 0 && pesticidesAnalyteChoiceFlag)) &&
      selectedSiteCodes.length > 0
        ? yield call(
            restURLQuery,
            EsriDESConfig.Tables.PRMWetSeason.url,
            `${where_sites} ${
              selectedDateOption.toString() ===
              EsriDESConfig.DatePickerOptions.DateRange.toString()
                ? where_dates_annual_reports
                : selectedDateOption.toString() ===
                  EsriDESConfig.DatePickerOptions.YearsRange.toString()
                ? where_dates
                : ''
            }`.replaceAll(
              '*PH-D*',
              EsriDESConfig.Tables.PRMWetSeason.YearsRangeColumnName || 'error',
            ),
            ['Site_Code'],
            true,
            true,
          )
        : 0;

    // REPORTS DATA SAVE
    const reportsData: ReportsData = {
      Concentrations: {
        sites: concentrationSitesDistinct || 0,
        results: concentrationSitesResults || 0,
        id: 'concentration',
        label: 'Concentration',
      },
      DailyLoad: {
        sites: dailyLoadSitesDistinct || 0,
        results: dailyLoadSitesResults || 0,
        id: 'daily load',
        label: 'Daily load',
      },
      AnnualLoad: {
        sites: annualLoadSitesDistinct || 0,
        results: annualLoadSitesResults || 0,
        label: 'Annual load/yield',
        id: 'annual load',
      },
      // AnnualFlow: {
      //   sites: annualFlowSitesDistinct || 0,
      //   results: annualFlowSitesResults || 0,
      //   label: 'Annual load/yield',
      //   id: 'annual flow',
      // },
      // AnnualConcentration: {
      //   sites: annualConcentrationSitesDistinct || 0,
      //   results: annualConcentrationSitesResults || 0,
      //   label: 'Annual load/yield',
      //   id: 'annual concentration',
      // },
      DailyPRM: {
        sites: PRMDailySitesDistinct || 0,
        results: PRMDailySitesResults || 0,
        label: 'Daily Pesticide Risk Metric',
        id: 'daily pesticide',
      },
      AnnualPRM: {
        sites: PRMAnnualySitesDistinct || 0,
        results: PRMAnnualySitesResults || 0,
        label: 'Wet season Pesticide Risk Metric',
        id: 'wet season',
      },
    };

    // REPORTS CHECKBOXES CLEANUP
    const reportsState = yield select(selectReportsArray);

    let availableReports: string[] = [];
    Object.keys(reportsData).forEach(
      (r: string) =>
        reportsData[r].sites > 0 && availableReports.push(reportsData[r].id),
    );
    yield call(loadAvailableYearsRange, availableReports);

    const selectedReportCheckboxes: HTMLCalciteCheckboxElement[] =
      reportsState.filter((c: HTMLCalciteCheckboxElement) => c.checked);
    if (selectedReportCheckboxes.length > 0) {
      selectedReportCheckboxes.forEach(
        (reportCheckbox: HTMLCalciteCheckboxElement) => {
          if (
            reportCheckbox.id.toLowerCase().includes('concentration') &&
            reportsData.Concentrations.sites <= 0
          )
            reportCheckbox.click();

          if (
            reportCheckbox.id.toLowerCase().includes('annual load') &&
            reportsData.AnnualLoad.sites <= 0
          )
            reportCheckbox.click();

          // if (
          //   reportCheckbox.id.toLowerCase().includes('annual flow') &&
          //   reportsData.AnnualFlow.sites <= 0
          // )
          //   reportCheckbox.click();

          // if (
          //   reportCheckbox.id.toLowerCase().includes('annual concentration') &&
          //   reportsData.AnnualConcentration.sites <= 0
          // )
          //   reportCheckbox.click();

          if (
            reportCheckbox.id.toLowerCase().includes('wet season') &&
            reportsData.AnnualPRM.sites <= 0
          )
            reportCheckbox.click();

          if (
            reportCheckbox.id.toLowerCase().includes('daily load') &&
            reportsData.DailyLoad.sites <= 0
          )
            reportCheckbox.click();

          if (
            reportCheckbox.id.toLowerCase().includes('daily pesticide') &&
            reportsData.DailyPRM.sites <= 0
          )
            reportCheckbox.click();
        },
      );
    }

    yield put(actions.setReportsData(reportsData));

    // Set calcLoadFlag to false, to mark the status that the data has been fetched now
    yield put(actions.setCalcLoadFlag(false));
  }
}

function calcAnnualRangeFromDate(val1, val2): string[] {
  const year1 = val1.getFullYear();
  const year2 = val2.getFullYear();
  let from_firstHalf = new Date();
  from_firstHalf.setFullYear(year1);
  from_firstHalf.setMonth(6);
  from_firstHalf.setDate(1);
  from_firstHalf.setHours(0, 0, 0, 0);

  let startYear = year1;
  let endYear = year2;
  if (val1 < from_firstHalf) {
    startYear = year1 - 1;
  }

  from_firstHalf = new Date();
  from_firstHalf.setFullYear(year2);
  from_firstHalf.setMonth(6);
  from_firstHalf.setDate(1);
  from_firstHalf.setHours(0, 0, 0, 0);
  if (val1 < from_firstHalf) {
    endYear = year2 - 1;
  }

  const yearRanges: string[] = [];

  for (let i = startYear; i <= endYear; i++) {
    yearRanges.push(`${i.toString()}-${(i + 1).toString()}`);
  }
  return yearRanges;
}

export async function restURLQuery(
  url,
  where,
  outputFields,
  countOnly = false,
  returnDistinctValues = false,
) {
  if (countOnly) {
    return await query
      .executeForCount(url, {
        returnGeometry: false,
        outFields: outputFields,
        where,
        returnDistinctValues,
      })
      .then(
        res => res,
        error => {
          console.error(`Bad query reutnred an error - ${error}`);
          return null;
        },
      );
  } else {
    return await query
      .executeQueryJSON(url, {
        outFields: outputFields,
        returnGeometry: false,
        where,
        returnDistinctValues,
      })
      .then(
        function (results) {
          if (results.hasOwnProperty('features')) {
            if (results.features.length > 0) {
              return results.features;
            } else {
              console.error('No sites found for a report');
              return [];
            }
          } else {
            console.error('ERROR - unexpected data structure returned');
            return null;
          }
        },
        function (error) {
          console.error('Error when trying to query sites - ' + error);
          return null;
        },
      );
  }
}
export async function getAllSiteCodes(sitesOIDsArray) {
  return await query
    .executeQueryJSON(EsriDESConfig.FeatureLayers.sites.url, {
      objectIds: sitesOIDsArray,
      outFields: ['Site_Code'],
      returnGeometry: false,
    })
    .then(
      function (results) {
        if (results.hasOwnProperty('features')) {
          if (results.features.length > 0) {
            return results.features;
          } else {
            console.error('No sites found based on OID array');
            return [];
          }
        } else {
          console.error('ERROR - unexpected data structure returned');
          return null;
        }
      },
      function (error) {
        console.error('Error when trying to query sites - ' + error);
        return null;
      },
    );
}
export function* getSites() {
  const url =
    EsriDESConfig.FeatureLayers.sites.url + EsriDESConfig.QueryParamsAll;
  yield getData(url);
}
export function* getAnalytes() {
  const url = EsriDESConfig.Tables.Analytes.url + EsriDESConfig.QueryParamsAll;
  yield getData(url);
}
export function* getBasins() {
  const url =
    EsriDESConfig.FeatureLayers.basins.url + EsriDESConfig.QueryParamsAll;
  yield getData(url);
}
export function* getRegions() {
  const url =
    EsriDESConfig.FeatureLayers.regions.url + EsriDESConfig.QueryParamsAll;
  yield getData(url);
}
export function* getAnalytesOrderData() {
  const url =
    EsriDESConfig.Tables.AnalytesOrder.url + EsriDESConfig.QueryParamsAll;
  yield getData(url);
}
export function* getAllInternalSitesOIDs() {
  const url =
    EsriDESConfig.FeatureLayers.sites.url +
    EsriDESConfig.QueryInternalSitesOIDs;
  yield getData(url);
}
function* getData(url, selector = null) {
  yield delay(500);

  const requestURL = url;

  try {
    const dataResponse: SitesListResponseItem = yield call(request, requestURL);
    if (dataResponse.hasOwnProperty('error'))
      throw Error('Error from query response');
    if (!dataResponse.hasOwnProperty('objectIds')) {
      const dataParsed: any[] =
        dataResponse.features?.map(f => f.attributes) || null;
      if (dataParsed?.length > 0) {
        if (dataParsed[0].hasOwnProperty(EsriDESConfig.RegionsOrderField)) {
          dataParsed.sort(
            (a, b) =>
              a[EsriDESConfig.RegionsOrderField] -
              b[EsriDESConfig.RegionsOrderField],
          );
        } else if (
          dataParsed[0].hasOwnProperty(EsriDESConfig.AnalytesOrderField)
        ) {
          dataParsed.sort(
            (a, b) =>
              a[EsriDESConfig.AnalytesOrderField] -
              b[EsriDESConfig.AnalytesOrderField],
          );
        }

        yield put(actions.dataLoaded(dataParsed));
      }
    } else {
      yield put(actions.dataLoaded(dataResponse.objectIds));
    }
  } catch (err: any) {
    console.log('ERROR returned from request');
  }
}

export function* esriDataFetchSaga() {
  yield takeLatest(actions.loadSites.type, getSites);
  yield takeLatest(actions.loadBasins.type, getBasins);
  yield takeLatest(actions.loadRegions.type, getRegions);
  yield takeLatest(actions.loadAnalytes.type, getAnalytes);
  yield takeLatest(actions.calculateReportCards.type, calculateReportCards);
  yield takeLatest(actions.loadAnalytesOrderTable.type, getAnalytesOrderData);
  yield takeLatest(actions.loadInternalSitesOIDs.type, getAllInternalSitesOIDs);
  yield takeLatest(actions.setSelectedSites.type, fetchSitesOIDs);
  yield actions.loadReportsData.type;
  yield actions.loadReportsState.type;
  yield actions.setChoiceCleanerSites.type;
  yield actions.setChoiceCleanerAnalytes.type;
  yield actions.loadDownloadBtn.type;
  yield actions.setInternalDataFlag.type;
  yield actions.setLayersLoadedFlag.type;
  yield actions.setSelectedRegion.type;
  yield actions.setSelectedAnalytes.type;
  yield actions.loadLocationsTree.type;
}
