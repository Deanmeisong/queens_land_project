import { CalciteCheckbox } from '@esri/calcite-components-react';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useESRIDataSlice } from '../esri/slice';
import EsriDESConfig from '../esri/appConfig';

import { selectDownloadBtn, selectReportsArray } from '../esri/slice/selectors';

export default function ReportCard({ reportName, totalSites, totalRseults }) {
  const dispatch = useDispatch();
  const { actions } = useESRIDataSlice();

  const downloadBtn = useSelector(selectDownloadBtn);
  const reportsState = useSelector(selectReportsArray);

  const checkboxNode = useRef<HTMLCalciteCheckboxElement>(null);
  const checkboxAttrs = {};

  const [isChecked, setIsChecked] = useState(
    checkboxAttrs['disabled'] || false,
  );

  // If any report has more than 500K record or no record, disable the check box
  if (totalRseults <= 0 || totalRseults > EsriDESConfig.DownloadLimit) {
    checkboxAttrs['disabled'] = true;
  }

  // ***** Calc years range for chosen reports + enable download *****
  function handleClick(evt) {
    setIsChecked(evt.target.checked);

    if (downloadBtn && reportsState && reportsState.length > 0) {
      if (reportsState.filter(i => i.checked).length > 0) {
        downloadBtn!.disabled = false;
      } else {
        downloadBtn!.disabled = true;
      }
    }
  }

  // ***** Store checkboxes in store *****
  useEffect(() => {
    if (
      checkboxNode &&
      !reportsState.map(i => i.id).includes(checkboxNode.current!.id)
    )
      dispatch(
        actions.setReportsState([...reportsState, checkboxNode.current]),
      );
  }, [checkboxNode, dispatch, actions, reportsState]);

  return (
    <CardWrapper
      style={{
        border: `${
          totalRseults > 0 && totalRseults <= EsriDESConfig.DownloadLimit
            ? '2'
            : '1'
        }px solid ${isChecked ? '#09549F' : '#e0e0e0'}`,
      }}
    >
      <CardTitle
        style={{
          color:
            totalRseults > 0 && totalRseults <= EsriDESConfig.DownloadLimit
              ? '#09549F'
              : '#151515',
        }}
      >
        {reportName}
        <Checkbox
          id={reportName}
          ref={checkboxNode}
          onCalciteCheckboxChange={handleClick}
          {...checkboxAttrs}
        ></Checkbox>
      </CardTitle>
      <TextWrapper>
        <span style={{ color: '#4A4A4A' }}>{totalSites} Sites,</span>
        <span style={{ color: '#4A4A4A' }}> {totalRseults} Results</span>
      </TextWrapper>
    </CardWrapper>
  );
}

const Checkbox = styled(CalciteCheckbox)`
  right: -7px;
  top: -5px;
`;

const TextWrapper = styled.div`
  margin-top: 5px;
  font-size: 12px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  & > * {
    margin-right: 5px;
  }
`;
const CardWrapper = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 7px;
  padding: 12px 16px 12px 16px;
  // margin-right: 48px;
  /* margin-right: 16px; for when scroll is closer */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
const CardTitle = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: bold;
`;
