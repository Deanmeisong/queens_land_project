import styled from 'styled-components';
import ChevronLeftIcon from 'calcite-ui-icons-react/ChevronLeftIcon';
import AnalyteComponent from '../analytecomp';
import LocationComponent from '../locationcomp';
import DatePickerComponent from '../datepickercomp';
import React, { useEffect, useRef, useState } from 'react';
import { Screens } from '../leftbar';
import { useNavigate } from 'react-router-dom';
import { Information } from '@carbon/icons-react';
import EsriDESConfig from '../esri/appConfig';
import { useESRIDataSlice } from '../esri/slice';
import { useDispatch, useSelector } from 'react-redux';
import { CalciteButton, CalciteTooltip } from '@esri/calcite-components-react';
import {
  selectChoiceCleanerBtnAnalytes,
  selectChoiceCleanerBtnSites,
  selectChosenAnalytes,
  selectChosenDateOption,
  selectChosenSiteCodes,
  setDateOptionVal,
} from '../esri/slice/selectors';

export default function SearchCriteria({
  showingComponent,
  setShowingComponent,
}) {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { actions } = useESRIDataSlice();

  const [analytesData, setAnalytesData] = useState();
  const [locationsData, setLocationsData] = useState();
  const [thirdPartySwitchState, setThirdPartySwitchState] = useState(false);
  const [datesPickerData, setDatesPickerData] = useState(
    EsriDESConfig.DatePickerOptions.Everything.toString(),
  );

  const filtersCleaner = useRef<HTMLCalciteButtonElement>(null);
  const selectedSiteCodes = useSelector(selectChosenSiteCodes);
  const selectedAnalytes = useSelector(selectChosenAnalytes);
  const selectedDateOption = useSelector(selectChosenDateOption);
  const setDateOption = useSelector(setDateOptionVal);

  const choiceCleanerBtnSites: HTMLCalciteButtonElement | null = useSelector(
    selectChoiceCleanerBtnSites,
  );
  const choiceCleanerBtnAnalytes: HTMLCalciteButtonElement | null = useSelector(
    selectChoiceCleanerBtnAnalytes,
  );

  useEffect(() => {
    dispatch(actions.setDatesOptionsVal([datesPickerData, setDatesPickerData]));
  }, [datesPickerData, dispatch, actions]);

  useEffect(() => {
    if (filtersCleaner && filtersCleaner.current) {
      if (
        selectedSiteCodes.length > 0 ||
        selectedAnalytes.length > 0 ||
        (selectedDateOption &&
          selectedDateOption.toString() !==
            EsriDESConfig.DatePickerOptions.Everything.toString())
      ) {
        filtersCleaner.current['disabled'] = false;
      } else {
        filtersCleaner.current['disabled'] = true;
      }
    }
  }, [filtersCleaner, selectedSiteCodes, selectedAnalytes, selectedDateOption]);

  function cleanAllFilters() {
    if (selectedSiteCodes.length > 0) {
      choiceCleanerBtnSites!.click();
    }
    if (selectedAnalytes.length > 0) {
      choiceCleanerBtnAnalytes!.click();
    }
    if (selectedDateOption !== EsriDESConfig.DatePickerOptions.Everything) {
      setDateOption(EsriDESConfig.DatePickerOptions.Everything);
      dispatch(
        actions.setSelectedDateOption(
          EsriDESConfig.DatePickerOptions.Everything,
        ),
      );

      // dispatch(
      //   actions.setSelectedDateOption(
      //     EsriDESConfig.DatePickerOptions.Everything,
      //   ),
      // );
    }
  }

  function handleDatePickerOptions(val) {
    setDatesPickerData(val);
  }

  function switchHandler() {
    choiceCleanerBtnSites!.click();
    setThirdPartySwitchState(!thirdPartySwitchState);
    dispatch(actions.setInternalDataFlag(!thirdPartySwitchState));
  }

  function handleClick() {
    navigate('/');
  }

  return (
    <SideBar
      key="searcher"
      className={showingComponent === Screens.Search ? 'showDiv' : 'hideDiv'}
    >
      <ContentScroller>
        <SearchContainer>
          {/* <HomeLink onClick={handleClick}>
            <ChevronLeftIcon color="#008635" />
            Home
          </HomeLink> */}
          <h2 className="SectionTitle">Search Criteria</h2>
          <ThirdPartyData>
            <div
              className="content"
              onClick={switchHandler}
              dangerouslySetInnerHTML={{
                __html:
                  '<calcite-switch class="custom-switch" scale="l"></calcite-switch>',
              }}
            ></div>
            Include third-party data
            <InfoIcon size={16} id="tooltipBtn" />
            <CalciteTooltip
              label="3rd-party data"
              reference-element="tooltipBtn"
            >
              <TooltipData>
                Third-party data are collected by multiple agencies and
                quality-coded outside the Quality Management System of the
                Program.
              </TooltipData>
            </CalciteTooltip>
          </ThirdPartyData>
          <StyledInput>
            Select location below or interact directly on the map to visually
            explore locations.
            <LocationComponent
              options={locationsData}
              setShowingComponent={setShowingComponent}
            ></LocationComponent>
            <Separator />
          </StyledInput>
          <Filters>
            The filters below do not interact directly with the map. This
            generate a customized report based on your selected preferences.
          </Filters>
          <StyledInput>
            <AnalyteComponent
              options={analytesData}
              setShowingComponent={setShowingComponent}
            ></AnalyteComponent>
          </StyledInput>
          <StyledInput>
            <DatePickerComponent
              option={datesPickerData}
              // TODO: Check this commented section
              // setShowingComponent={setShowingComponent}
              onDropDownChange={handleDatePickerOptions}
            ></DatePickerComponent>
          </StyledInput>
        </SearchContainer>
      </ContentScroller>
      <Button ref={filtersCleaner} onClick={cleanAllFilters} target="_blank">
        Clear all filters
      </Button>
    </SideBar>
  );
}

const TooltipData = styled.span`
  font-family: 'Lato';
  font-size: 14px;
`;
const InfoIcon = styled(Information)`
  cursor: pointer;
  color: #008733;
  margin-left: 15px;
`;
const Button = styled(CalciteButton)`
  position: absolute;
  bottom: 24px;
`;

const ContentScroller = styled.div`
  max-height: calc(100% - 80px);
  overflow-y: auto;
  // padding-right: 32px;
  overflow-x: hidden;

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
`;

const Separator = styled.hr`
  width: auto;
  color: #ebebeb;
  border: 1px solid;
  margin: 24px 0 24px 0;
`;

const HomeLink = styled.span`
  font-family: 'Lato';
  color: #09549f;
  text-decoration: underline;
  cursor: pointer;
`;

const SearchContainer = styled.div`
  margin: 24px 0 24px 0;
`;

const ThirdPartyData = styled.div`
  margin: 24px 0px 24px 5px;
  flex-wrap: nowrap;
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  align-content: center;
  align-items: center;

  & > * {
    margin-right: 16px;
  }
`;

const StyledInput = styled.div`
  margin: 24px 0 24px 0;
`;

const Filters = styled.div`
  margin: 24px 0 24px 0;
`;

const SideBar = styled.div`
  padding: 0 2rem 0 4rem;
  height: calc(100vh - 240px);
`;
