import React from 'react';
import styled from 'styled-components';
import { CalciteOption, CalciteSelect } from '@esri/calcite-components-react';
import { Screens } from '../leftbar';
import { useSelector } from 'react-redux';
import { selectChosenSites } from '../esri/slice/selectors';

export default function LocationComponent({ options, setShowingComponent }) {
  const sites: Array<string> = useSelector(selectChosenSites);
  function locationHandler() {
    setShowingComponent(Screens.Locations);
  }
  return (
    <ComponentWrapper>
      <Title>
        <Text>*</Text>Location
      </Title>
      <OverlayWrapper>
        <Overlay style={{ zIndex: 900 }} onClick={locationHandler}></Overlay>
        <Overlay onClick={locationHandler}>
          <CalciteSelect scale="l" label={'location'} value={options}>
            <CalciteOption key={10} value={'10'}>
              {sites.length <= 0
                ? 'Select location'
                : `${
                    sites.filter((s: any) => s.includes('site_')).length
                  } locations selected`}
            </CalciteOption>
          </CalciteSelect>
        </Overlay>
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
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
`;
