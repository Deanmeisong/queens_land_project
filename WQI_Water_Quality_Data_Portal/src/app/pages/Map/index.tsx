import * as React from 'react';
import Layout from '../../components/layout';
import LeftSidebar from '../../components/leftbar';
import RightSidebar from '../../components/rightbar';
import ESRI from '../../components/esri';
import styled from 'styled-components';
import { Navbar } from '../HomePage/elements/navbar';
import { useESRIDataSlice } from 'app/components/esri/slice';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';

export function Map() {
  const [RightSideBarState, setRightSideBarState] = React.useState(true);
  const dispatch = useDispatch();

  const { actions } = useESRIDataSlice();

  const useEffectOnMount = (effect: React.EffectCallback) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(effect, []);
  };

  useEffectOnMount(() => {
    dispatch(actions.loadSites());
    dispatch(actions.loadBasins());
    dispatch(actions.loadRegions());
    dispatch(actions.loadAnalytes());
    dispatch(actions.loadReportsData());
    dispatch(actions.loadReportsState());
    dispatch(actions.loadInternalSitesOIDs());
    dispatch(actions.loadAnalytesOrderTable());
  });

  return (
    <Layout>
      <Navbar />
      <MainView>
        <LeftSidebar />
        <ESRI RightSideBarState={RightSideBarState} />
        <RightSidebar
          ChangeSideBarState={() => setRightSideBarState(!RightSideBarState)}
          RightSideBarState={RightSideBarState}
        />
      </MainView>
    </Layout>
  );
}

const MainView = styled.div`
  border: '1px solid black';
  display: flex;
  height: inherit;
  /* width: 100%; */
`;
