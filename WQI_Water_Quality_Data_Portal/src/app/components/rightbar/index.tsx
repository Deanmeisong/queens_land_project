import styled from 'styled-components';
import InfoMessage from '../infomessage';
import ReportCard from '../reportcard';
import arrow from 'images/arrow4.svg';
import WarnMessage from '../warnmessage';

import React, { useEffect, useRef, useState } from 'react';
import { Loading } from 'carbon-components-react';
import { Checkmark } from '@carbon/icons-react';
import EsriDESConfig from '../esri/appConfig';
import { CalciteButton } from '@esri/calcite-components-react';
import { useESRIDataSlice } from '../esri/slice';
import { queryAllFeatures } from 'query-all-features';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectReportsData,
  selectReportsArray,
  selectChosenAnalytes,
  selectChosenSiteCodes,
  selectChosenDateRange,
  selectChosenDateOption,
  selectChosenYearsRange,
  selectCalcLoadFlag,
} from '../esri/slice/selectors';

export default function RightSidebar({
  ChangeSideBarState,
  RightSideBarState,
}) {
  // Set InfoMessage appear by default (true)
  const [showInfoMessage, setShowInfoMessage] = useState(true);
  const [showWarnMessage, setShowWarnMessage] = useState(false);
  const [alertText, setAlertText] = useState(false);

  // Check the flag of whether data fetch query has completed
  const isCalcLoadFlag = useSelector(selectCalcLoadFlag);

  const dispatch = useDispatch();
  const { actions } = useESRIDataSlice();

  const downloadAlert = useRef<HTMLDivElement>(null);
  const downloadBtn = useRef<HTMLCalciteButtonElement | null>(null);

  const reportsData = useSelector(selectReportsData);
  const reportsState = useSelector(selectReportsArray);
  const selectedReportsToGenerate: { count } = { count: 0 };

  const selectedSiteCodes = useSelector(selectChosenSiteCodes);
  const selectedAnalytes = useSelector(selectChosenAnalytes);
  const selectedDateOption = useSelector(selectChosenDateOption);
  const selectedDateRange = useSelector(selectChosenDateRange);
  const selectedYearsRange = useSelector(selectChosenYearsRange);

  // ***** Move to state *****
  // TODO: Check if required
  useEffect(() => {
    if (downloadBtn && downloadBtn.current)
      dispatch(actions.setDownloadBtn(downloadBtn.current));
  }, [downloadBtn, dispatch, actions]);

  //Check the result number
  useEffect(() => {
    if (reportsData) {
      let card_number = 0;
      Object.keys(reportsData).forEach(k => {
        if (reportsData[k].results > EsriDESConfig.DownloadLimit) {
          card_number += 1;
        }
      });

      if (card_number > 0) {
        // If there is at least one report having more than 500K result, show the warning message
        setShowInfoMessage(false);
        setShowWarnMessage(true);
      } else {
        setShowInfoMessage(true);
        setShowWarnMessage(false);
      }
    }
  }, [reportsData]);

  // ***** Calc numbers on selection change *****
  useEffect(() => {
    selectedSiteCodes &&
      selectedSiteCodes.filter(s => s.includes('site_')).length >= 0 &&
      dispatch(actions.calculateReportCards());
  }, [selectedSiteCodes, dispatch, actions]);

  async function handleDownload() {
    const selectedReportCheckboxes: HTMLCalciteCheckboxElement[] =
      reportsState.filter((c: HTMLCalciteCheckboxElement) => c.checked);
    const reportsToGenerate = selectedReportCheckboxes.map(r => r.id);
    if (selectedReportCheckboxes.length > 0) {
      selectedReportCheckboxes.forEach((c: HTMLCalciteCheckboxElement) =>
        c.click(),
      );
    }

    setAlertText(true);
    downloadAlert.current?.classList.add('showAlert');

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
      selectedDateRange.length > 0 &&
      selectedDateOption.toString() ===
        EsriDESConfig.DatePickerOptions.DateRange.toString()
        ? `AND *PH-D* in (${customYearsRange.map(
            dr => `'${dr.replaceAll(/\s+/g, '')}'`,
          )})`
        : '';

    selectedSiteCodes &&
      (await reportsToGenerate.forEach(async report => {
        const now = new Date();

        const lengthLimitForPOST = 1500;

        // Increment the wait time for reports generating
        if (report.toLowerCase().includes('concentration'))
          selectedReportsToGenerate.count = selectedReportsToGenerate.count + 1;
        if (report.toLowerCase().includes('daily load'))
          selectedReportsToGenerate.count = selectedReportsToGenerate.count + 1;
        if (report.toLowerCase().includes('annual load'))
          selectedReportsToGenerate.count = selectedReportsToGenerate.count + 1;
        if (report.toLowerCase().includes('daily pest'))
          selectedReportsToGenerate.count = selectedReportsToGenerate.count + 1;
        if (report.toLowerCase().includes('wet season'))
          selectedReportsToGenerate.count = selectedReportsToGenerate.count + 1;

        // Generate reports for each selected option (SYNCHRONOUSLY)
        if (report.toLowerCase().includes('concentration')) {
          const whereStatement =
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
              );
          const queryResults = await queryAllFeatures({
            httpMethod:
              encodeURIComponent(whereStatement).length > lengthLimitForPOST
                ? 'POST'
                : 'GET',
            url: EsriDESConfig.Tables.Concentration.url,
            where: whereStatement,
            outputFields: ['*'],
            orderByFields: EsriDESConfig.Tables.Concentration.QueryOrderFields,
          });

          const reportName = `Concentration_${
            now.toISOString().split('T')[0]
          }_${now.getHours()}-${now.getMinutes()}`;
          await downloadCSV(
            queryResults.features.map(
              f =>
                delete f.attributes[queryResults.objectIdFieldName] &&
                f.attributes,
            ),
            reportName,
            queryResults.fields
              .filter(f => f.alias !== queryResults.objectIdFieldName)
              .map(f => f.alias),
          );
        }

        if (report.toLowerCase().includes('daily load')) {
          const whereStatement =
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
              );
          const queryResults = await queryAllFeatures({
            httpMethod:
              encodeURIComponent(whereStatement).length > lengthLimitForPOST
                ? 'POST'
                : 'GET',
            url: EsriDESConfig.Tables.DailyLoad.url,
            where: whereStatement,
            outputFields: ['*'],
            orderByFields: EsriDESConfig.Tables.DailyLoad.QueryOrderFields,
          });

          const reportName = `DailyLoad_${
            now.toISOString().split('T')[0]
          }_${now.getHours()}-${now.getMinutes()}`;
          await downloadCSV(
            queryResults.features.map(
              f =>
                delete f.attributes[queryResults.objectIdFieldName] &&
                f.attributes,
            ),
            reportName,
            queryResults.fields
              .filter(f => f.alias !== queryResults.objectIdFieldName)
              .map(f => f.alias),
          );
        }

        if (report.toLowerCase().includes('annual load')) {
          const whereStatement = `${where_sites} ${
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
            );

          // Add download for annual flow report
          const flowWhereStatement = `${where_sites} ${
            selectedDateOption.toString() ===
            EsriDESConfig.DatePickerOptions.DateRange.toString()
              ? where_dates_annual_reports
              : selectedDateOption.toString() ===
                EsriDESConfig.DatePickerOptions.YearsRange.toString()
              ? where_dates
              : ''
          } `.replaceAll(
            '*PH-D*',
            EsriDESConfig.Tables.AnnualFlow.YearsRangeColumnName || 'error',
          );

          // Add download for annual concentration report
          const conWhereStatement = `${where_sites} ${
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
              EsriDESConfig.Tables.AnnualConcentration.AnalyteColumnName ||
                'error',
            )
            .replaceAll(
              '*PH-D*',
              EsriDESConfig.Tables.AnnualConcentration.YearsRangeColumnName ||
                'error',
            );

          const reportName = `AnnualLoad_${
            now.toISOString().split('T')[0]
          }_${now.getHours()}-${now.getMinutes()}`;

          const flowReportName = `AnnualFlow_${
            now.toISOString().split('T')[0]
          }_${now.getHours()}-${now.getMinutes()}`;

          const conReportName = `AnnualConcentration_${
            now.toISOString().split('T')[0]
          }_${now.getHours()}-${now.getMinutes()}`;

          const [queryResults, flowQueryResults, conQueryResults] =
            await Promise.all([
              queryAllFeatures({
                httpMethod:
                  encodeURIComponent(whereStatement).length > lengthLimitForPOST
                    ? 'POST'
                    : 'GET',
                url: EsriDESConfig.Tables.AnnualLoad.url,
                where: whereStatement,
                outputFields: ['*'],
                orderByFields: EsriDESConfig.Tables.AnnualLoad.QueryOrderFields,
              }),
              queryAllFeatures({
                httpMethod:
                  encodeURIComponent(flowWhereStatement).length >
                  lengthLimitForPOST
                    ? 'POST'
                    : 'GET',
                url: EsriDESConfig.Tables.AnnualFlow.url,
                where: flowWhereStatement,
                outputFields: ['*'],
                orderByFields: EsriDESConfig.Tables.AnnualFlow.QueryOrderFields,
              }),
              queryAllFeatures({
                httpMethod:
                  encodeURIComponent(conWhereStatement).length >
                  lengthLimitForPOST
                    ? 'POST'
                    : 'GET',
                url: EsriDESConfig.Tables.AnnualConcentration.url,
                where: conWhereStatement,
                outputFields: ['*'],
                orderByFields:
                  EsriDESConfig.Tables.AnnualConcentration.QueryOrderFields,
              }),
            ]);

          await Promise.all([
            downloadCSV(
              queryResults.features.map(
                f =>
                  delete f.attributes[queryResults.objectIdFieldName] &&
                  f.attributes,
              ),
              reportName,
              queryResults.fields
                .filter(f => f.alias !== queryResults.objectIdFieldName)
                .map(f => f.alias),
            ),
            downloadCSV(
              flowQueryResults.features.map(
                f =>
                  delete f.attributes[flowQueryResults.objectIdFieldName] &&
                  f.attributes,
              ),
              flowReportName,
              flowQueryResults.fields
                .filter(f => f.alias !== flowQueryResults.objectIdFieldName)
                .map(f => f.alias),
            ),
            downloadCSV(
              conQueryResults.features.map(
                f =>
                  delete f.attributes[conQueryResults.objectIdFieldName] &&
                  f.attributes,
              ),
              conReportName,
              conQueryResults.fields
                .filter(f => f.alias !== conQueryResults.objectIdFieldName)
                .map(f => f.alias),
            ),
          ]);
        }

        if (report.toLowerCase().includes('daily pest')) {
          const whereStatement = `${where_sites} ${where_dates}`.replaceAll(
            '*PH-D*',
            (selectedDateOption.toString() ===
            EsriDESConfig.DatePickerOptions.DateRange.toString()
              ? EsriDESConfig.Tables.PRMDaily.DateColumnName
              : selectedDateOption.toString() ===
                EsriDESConfig.DatePickerOptions.YearsRange.toString()
              ? EsriDESConfig.Tables.PRMDaily.YearsRangeColumnName
              : '') || 'error',
          );
          const queryResults = await queryAllFeatures({
            httpMethod:
              encodeURIComponent(whereStatement).length > lengthLimitForPOST
                ? 'POST'
                : 'GET',
            url: EsriDESConfig.Tables.PRMDaily.url,
            where: whereStatement,
            outputFields: ['*'],
            orderByFields: EsriDESConfig.Tables.PRMDaily.QueryOrderFields,
          });

          const reportName = `PRMDaily_${
            now.toISOString().split('T')[0]
          }_${now.getHours()}-${now.getMinutes()}`;
          await downloadCSV(
            queryResults.features.map(
              f =>
                delete f.attributes[queryResults.objectIdFieldName] &&
                f.attributes,
            ),
            reportName,
            queryResults.fields
              .filter(f => f.alias !== queryResults.objectIdFieldName)
              .map(f => f.alias),
          );
        }

        if (report.toLowerCase().includes('wet season')) {
          const whereStatement = `${where_sites} ${
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
          );
          const queryResults = await queryAllFeatures({
            httpMethod:
              encodeURIComponent(whereStatement).length > lengthLimitForPOST
                ? 'POST'
                : 'GET',
            url: EsriDESConfig.Tables.PRMWetSeason.url,
            where: whereStatement,
            outputFields: ['*'],
            orderByFields: EsriDESConfig.Tables.PRMWetSeason.QueryOrderFields,
          });

          const reportName = `PRMWetSeason_${
            now.toISOString().split('T')[0]
          }_${now.getHours()}-${now.getMinutes()}`;
          await downloadCSV(
            queryResults.features.map(
              f =>
                delete f.attributes[queryResults.objectIdFieldName] &&
                f.attributes,
            ),
            reportName,
            queryResults.fields
              .filter(f => f.alias !== queryResults.objectIdFieldName)
              .map(f => f.alias),
          );
        }
      }));
  }

  const checkboxAttrs = {};
  if (
    reportsState &&
    reportsState.filter((c: HTMLCalciteCheckboxElement) => c.checked).length > 0
  ) {
  } else {
    checkboxAttrs['disabled'] = true;
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
    if (val1 < from_firstHalf) {
      endYear = year2 - 1;
    }

    const yearRanges: string[] = [];

    for (let i = startYear; i <= endYear; i++) {
      yearRanges.push(`${i.toString()}-${(i + 1).toString()}`);
    }
    return yearRanges;
  }

  async function downloadCSV(data, sensor, header) {
    return new Promise(async resolve => {
      if (data.length > 0) {
        let csvHeader = header.join(',') + '\n'; // header row
        const dateColumn =
          Object.keys(data[0]).find(
            i =>
              i.toLowerCase().includes('date') &&
              !i.toLowerCase().includes('yyyy'),
          ) || '';
        const dateColumnIndex: number =
          Object.keys(data[0]).indexOf(dateColumn) || -1;

        let csvBody = data
          .map(row => {
            let parsedData = Object.values(row);
            if (
              dateColumnIndex >= 0 &&
              typeof parsedData[dateColumnIndex] === 'number'
            ) {
              const epochVal: any = parsedData[dateColumnIndex];
              const tempISOFormat = new Date(epochVal).toISOString().split('T');
              const tempISOFormatDate = tempISOFormat[0].split('-');
              const tempISOFormatTime = tempISOFormat[1].split(':');
              const customDateFormat = `${tempISOFormatDate[2]}/${tempISOFormatDate[1]}/${tempISOFormatDate[0]} ${tempISOFormatTime[0]}:${tempISOFormatTime[1]}`;

              parsedData[dateColumnIndex] = customDateFormat;
            }
            return parsedData.map(i => `"${i || ''}"`).join(',');
          })
          .join('\n');

        var hiddenElement = document.createElement('a');
        hiddenElement.href =
          'data:text/csv;charset=utf-8,' + encodeURI(csvHeader + csvBody);
        hiddenElement.target = '_blank';
        hiddenElement.download = sensor + '.csv';
        hiddenElement.click();

        selectedReportsToGenerate.count = selectedReportsToGenerate.count - 1;
        // await dispatch(actions.setGeneratingReports(generatingReports - 1));
        if (selectedReportsToGenerate.count <= 0) {
          setAlertText(false);
          await timeout(1000);
          downloadAlert.current?.classList.remove('showAlert');
        }

        return resolve;
      } else {
        selectedReportsToGenerate.count = selectedReportsToGenerate.count - 1;
        // await dispatch(actions.setGeneratingReports(generatingReports - 1));
        console.error('No data could be fetched for the report');
        return resolve;
      }
    });
  }

  function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function closeInfoMessage() {
    setShowInfoMessage(false);
  }
  function closeWarnMessage() {
    setShowWarnMessage(false);
  }
  async function handleReportsSideBar(evt) {
    ChangeSideBarState(RightSideBarState);
  }

  return (
    <RightSideBarWrapper>
      <CollapseWrapper>
        <Collapse
          key="collapseButton"
          className="collapseButton"
          onClick={handleReportsSideBar}
        />
      </CollapseWrapper>
      <div
        className={showWarnMessage ? 'showDiv' : 'hideDiv'}
        style={{ zIndex: '3' }}
      >
        <WarnMessage setShowMessage={closeWarnMessage}></WarnMessage>
      </div>
      <div
        className={showInfoMessage ? 'showDiv' : 'hideDiv'}
        style={{ zIndex: '3' }}
      >
        <InfoMessage setShowMessage={closeInfoMessage}></InfoMessage>
      </div>

      <LoadDataMessage>
        {isCalcLoadFlag
          ? [
              <div
                key="spinnerWrapper"
                style={{
                  position: 'fixed',
                  justifyContent: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  height: '70%',
                  width: '400px',
                  zIndex: 999,
                }}
              >
                <Loading key="querySpinner" withOverlay={false} />
              </div>,
            ]
          : null}
      </LoadDataMessage>

      <RightSideBar
        style={{
          maxHeight: `calc(100vh - 260px ${showInfoMessage ? '- 112px' : ''})`,
        }}
      >
        <h2 className="SectionTitle">Select report</h2>
        <span>Select your preferred report(s)</span>
        <Reports>
          <ReportCard
            key={0}
            totalSites={0 || reportsData?.Concentrations.sites}
            totalRseults={0 || reportsData?.Concentrations.results}
            reportName="Concentration"
          />
          <ReportCard
            key={1}
            totalSites={0 || reportsData?.DailyLoad.sites}
            totalRseults={0 || reportsData?.DailyLoad.results}
            reportName="Daily load"
          />
          <ReportCard
            key={2}
            totalSites={0 || reportsData?.AnnualLoad.sites}
            totalRseults={0 || reportsData?.AnnualLoad.results}
            reportName="Annual load/yield"
          />
          <ReportCard
            key={3}
            totalSites={0 || reportsData?.AnnualPRM.sites}
            totalRseults={0 || reportsData?.AnnualPRM.results}
            reportName="Wet season Pesticide Risk Metric"
          />
          <ReportCard
            key={4}
            totalSites={0 || reportsData?.DailyPRM.sites}
            totalRseults={0 || reportsData?.DailyPRM.results}
            reportName="Daily Pesticide Risk Metric"
          />
        </Reports>
      </RightSideBar>
      <Download
        appearance="transparent"
        kind="inverse"
        scale="l"
        key="downloadBtnKey"
        onClick={handleDownload}
        ref={downloadBtn}
        {...checkboxAttrs}
      >
        Download
      </Download>

      <div style={{ position: 'relative' }}>
        <DownloadAlert key="downloadAlert" ref={downloadAlert}>
          {alertText
            ? [
                <div key="spinnerWrapper" style={{ display: 'flex' }}>
                  <Loading key="loadingSpinner" withOverlay={false} small />{' '}
                  &nbsp; Generating report please wait..
                </div>,
              ]
            : [
                <Checkmark
                  key="checkmarkIcon"
                  style={{ color: '#008733' }}
                  size="20"
                />,
                ` Report successfully downloaded`,
              ]}
        </DownloadAlert>
      </div>
      {/* <CalciteDropdown width="m">
          <Download slot="trigger" ref={downloadBtn} {...checkboxAttrs}>
        <CalciteDropdownItem style={{ position: 'sticky' }}>
          Download as .csv
        </CalciteDropdownItem>
      </CalciteDropdown> */}
    </RightSideBarWrapper>
  );
}

const Download = styled(CalciteButton)`
  margin: 0px 4rem 0 2rem;
  width: -webkit-fill-available;
  justify-content: center;
  border-radius: 0.25rem;
  box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2),
    0px 4px 8px 3px rgba(0, 0, 0, 0.1);

  background-color: #09549f;
`;

const DownloadAlert = styled.div`
  position: relative;
  left: 5rem;
  padding-top: 6px;
  opacity: 0;
  -webkit-transition: opacity 0.1s ease-in-out;
  -moz-transition: opacity 0.1s ease-in-out;
  -o-transition: opacity 0.1s ease-in-out;
  transition: opacity 0.1s ease-in-out;
`;

const Reports = styled.div`
  & > :not(:last-child) {
    margin-bottom: 24px;
  }
`;

const RightSideBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0;
  width: 400px !important;
  max-width: 400px;
  min-width: 400px;
  height: 100%;
`;
const RightSideBar = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 4rem 1.5rem 2rem;
  -webkit-transition: all 0.3s ease-in-out;
  -moz-transition: all 0.3s ease-in-out;
  -o-transition: all 0.3s ease-in-out;
  transition: all 0.3s ease-in-out;

  &::-webkit-scrollbar {
    width: 9px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f5f5f5;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e0e0e0;
    border-radius: 10px;
  }

  & > :not(:last-child) {
    margin: 0 0 18px 0;
  }
`;

const CollapseWrapper = styled.div`
  position: sticky;
  height: 0px;
`;

const Collapse = styled.div`
  background-color: white;
  opacity: 0.8;
  background-position: center;
  border-radius: 8px;
  background-image: url(${arrow});
  position: relative;
  display: flex;
  z-index: 1;
  left: -15px;
  /* bottom: calc(50vh - 100px); */
  width: 25px;
  height: 55px;
  -webkit-transition: all 0.3s ease-in-out;
  -moz-transition: all 0.3s ease-in-out;
  -o-transition: all 0.3s ease-in-out;
  transition: all 0.3s ease-in-out;
`;

const LoadDataMessage = styled.div`
  position: relative;
  text-align: center;
  padding-top: 6px;
  -webkit-transition: opacity 0.1s ease-in-out;
  -moz-transition: opacity 0.1s ease-in-out;
  -o-transition: opacity 0.1s ease-in-out;
  transition: opacity 0.1s ease-in-out;
`;
