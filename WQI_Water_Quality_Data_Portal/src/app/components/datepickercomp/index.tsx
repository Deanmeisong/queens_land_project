import styled from 'styled-components';
import React, { useEffect, useRef, useState } from 'react';
import { CalciteOption, CalciteSelect } from '@esri/calcite-components-react';
import { useDispatch, useSelector } from 'react-redux';
import { useESRIDataSlice } from '../esri/slice';
import EsriDESConfig from '../esri/appConfig';
import {
  MultiSelect,
  DatePicker,
  DatePickerInput,
} from 'carbon-components-react';
import {
  selectAvailableYearsRange,
  selectChosenSites,
} from '../esri/slice/selectors';

export default function DatePickerComponent({ option, onDropDownChange }) {
  const dispatch = useDispatch();
  const { actions } = useESRIDataSlice();

  const yearsRange = useSelector(selectAvailableYearsRange);
  const sites: Array<string> = useSelector(selectChosenSites);
  const [dynamicYearlyRange, setDynamicYearlyRange] = useState<Array<string>>(
    [],
  );

  const yearsRangeNode = useRef<HTMLCalciteSelectElement>(null);
  const datesOptionSelect = useRef<HTMLCalciteSelectElement>(null);

  function dateChoiceChanged(evt) {
    onDropDownChange(evt.target.selectedOption.value);

    dispatch(actions.setSelectedDateOption(evt.target.selectedOption.value));
    dispatch(actions.calculateReportCards());
  }

  function dateRangeChanged(evt) {
    if (evt && evt.length > 1) {
      dispatch(actions.setSelectedDateRangeOption(evt));
    } else {
      dispatch(actions.setSelectedDateRangeOption([]));
    }

    dispatch(actions.calculateReportCards());
  }

  function yearsRangeSelectionChange(evt) {
    if (
      evt &&
      evt.selectedItems &&
      !evt.selectedItems
        .map(i => i.toLowerCase().includes('no data'))
        .includes(true)
    ) {
      dispatch(actions.setSelectedYearsRangeOption(evt.selectedItems));
    } else {
      dispatch(actions.setSelectedYearsRangeOption([]));
    }
    dispatch(actions.calculateReportCards());
  }

  useEffect(() => {
    if (yearsRange.length > 0) {
      setDynamicYearlyRange(
        yearsRange.filter(i => i).map(i => i.replace('-', ' - ')),
      );
    } else {
      setDynamicYearlyRange(['No data found for the report']);
    }
  }, [yearsRange, yearsRangeNode]);

  if (datesOptionSelect && datesOptionSelect.current)
    sites.filter(s => s.includes('site_')).length <= 0
      ? (datesOptionSelect.current.disabled = true)
      : (datesOptionSelect.current.disabled = false);

  const ComponentsSwitcher =
    option === EsriDESConfig.DatePickerOptions.DateRange.toString() ? (
      <DatePicker
        datePickerType="range"
        dateFormat="d/m/Y"
        light
        onChange={dateRangeChanged}
        className="custom-date-picker"
      >
        <DatePickerInput
          id="range-selection-start"
          placeholder="dd/mm/yyyy"
          labelText=""
          size="lg"
        />
        <DatePickerInput
          id="range-selection-finish"
          placeholder="dd/mm/yyyy"
          labelText=""
          size="lg"
        />
      </DatePicker>
    ) : option === EsriDESConfig.DatePickerOptions.YearsRange.toString() ? (
      <MultiSelect
        onChange={yearsRangeSelectionChange}
        id="year-selection"
        ariaLabel="MultiSelect"
        label="Select year"
        className="yearsRange"
        size="lg"
        ref={yearsRangeNode}
        items={dynamicYearlyRange}
        direction="top"
        light
      ></MultiSelect>
    ) : (
      ''.toString()
    );

  return (
    <ComponentWrapper>
      <OverlayWrapper>
        <Title>
          <Text>*</Text> Date
        </Title>
        <CalciteSelect
          ref={datesOptionSelect}
          scale="l"
          label={'dates'}
          value={option}
          onCalciteSelectChange={dateChoiceChanged}
        >
          <CalciteOption
            key={EsriDESConfig.DatePickerOptions.Everything}
            value={EsriDESConfig.DatePickerOptions.Everything.toString()}
          >
            All available date
          </CalciteOption>
          <CalciteOption
            key={EsriDESConfig.DatePickerOptions.YearsRange}
            value={EsriDESConfig.DatePickerOptions.YearsRange.toString()}
          >
            By yearly range
          </CalciteOption>
          <CalciteOption
            key={EsriDESConfig.DatePickerOptions.DateRange}
            value={EsriDESConfig.DatePickerOptions.DateRange.toString()}
          >
            By date range
          </CalciteOption>
        </CalciteSelect>
        {sites.filter(s => s.includes('site_')).length > 0
          ? ComponentsSwitcher
          : null}
      </OverlayWrapper>
    </ComponentWrapper>
  );
}

const Text = styled.span`
  color: red;
  margin-right: 5px;
`;

const ComponentWrapper = styled.div`
  margin: 15px 0 0 0;
`;

const OverlayWrapper = styled.div`
  display: block;

  > * {
    margin: 0 5px 7px 0;
  }
`;

const Title = styled.div`
  font-size: 14px;
  line-height: 25px;
  font-weight: bold;
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
`;
