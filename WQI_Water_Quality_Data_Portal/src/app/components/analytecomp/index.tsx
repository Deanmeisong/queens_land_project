import React, { useRef } from 'react';
import styled from 'styled-components';
import { CalciteOption, CalciteSelect } from '@esri/calcite-components-react';
import { Screens } from '../leftbar';
import { selectChosenAnalytes } from '../esri/slice/selectors';
import { useSelector } from 'react-redux';

export default function AnalyteComponent({ options, setShowingComponent }) {
  const analytes: Array<string> = useSelector(selectChosenAnalytes);
  const analytesOverlay = useRef<HTMLDivElement>(null);

  function analyteHandler() {
    setShowingComponent(Screens.Analytess);
  }
  return (
    <ComponentWrapper>
      <Title>Analytes</Title>
      <OverlayWrapper>
        <Overlay
          ref={analytesOverlay}
          style={{ zIndex: 2 }}
          onClick={analyteHandler}
        ></Overlay>
        <Overlay>
          <CalciteSelect scale="l" label={'analyte'} value={options}>
            <CalciteOption key={10} value={'10'}>
              {analytes.length <= 0
                ? 'Select analytes'
                : `${
                    analytes.filter((s: any) => s.includes('analyte_')).length
                  } analytes selected`}
            </CalciteOption>
          </CalciteSelect>
        </Overlay>
      </OverlayWrapper>
    </ComponentWrapper>
  );
}

const ComponentWrapper = styled.div`
  margin: 15px 0 0 0;
`;

const OverlayWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
`;
const Overlay = styled.div`
  grid-row-start: 1;
  grid-column-start: 1;
  height: 47px;
  width: auto;
  margin-right: 5px;
`;

const Title = styled.div`
  font-size: 14px;
  line-height: 33px;
  font-weight: bold;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
`;
