import React, { useState } from 'react';
import styled from 'styled-components';
import SearchCriteria from '../search';
import LocationScreen from '../locationscreen';
import AnalyteScreen from '../analytescreen';

export enum Screens {
  Search = 0,
  Locations = 1,
  Analytess = 2,
}
export default function LeftSidebar() {
  const [showingComponent, setShowingComponent] = useState(Screens.Search);

  return (
    <LeftSideBar
      style={{
        backgroundColor:
          showingComponent !== Screens.Search ? '#f5f5f5' : 'white',
      }}
    >
      <SearchCriteria
        showingComponent={showingComponent}
        setShowingComponent={setShowingComponent}
      ></SearchCriteria>
      <LocationScreen
        showingComponent={showingComponent}
        setShowingComponent={setShowingComponent}
      ></LocationScreen>
      <AnalyteScreen
        showingComponent={showingComponent}
        setShowingComponent={setShowingComponent}
      ></AnalyteScreen>
    </LeftSideBar>
  );
}

const LeftSideBar = styled.div`
  max-height: calc(100% - 0); // removed 24px
  display: flex;
  flex-direction: column;
  width: 400px !important;
  max-width: 400px;
  min-width: 400px;
  -webkit-transition: width 0.3s ease-in-out;
  -moz-transition: width 0.3s ease-in-out;
  -o-transition: width 0.3s ease-in-out;
  transition: width 0.3s ease-in-out;
`;
