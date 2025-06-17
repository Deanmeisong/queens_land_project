import * as React from 'react';
import Layout from '../../components/layout';
import styled from 'styled-components';
import { Footer } from './elements/footer';
// import { Navbar } from '../HomePage/elements/navbar';
import { Navbar } from '../HomePage/elements/navbar';
import { BlueParagraph } from './elements/blueparagraph';
import { IntroductionParagraph } from './elements/intoparagraph';
import { DataControl } from './elements/datacontrol';
import { DataCollect } from './elements/datacollect';
import { SiteInstallation } from './elements/siteinstallation';
import { SiteMonitor } from './elements/sitemonitor';

export function AboutData() {
  return (
    <Layout>
      <Navbar />
      <BlueParagraph />
      <IntroductionParagraph />
      <DataControl />
      <DataCollect />
      <SiteInstallation />
      <SiteMonitor />
      <Footer />
    </Layout>
  );
}

const BottomText = styled.div`
  font-size: 17px;
  font-family: 'Lato';
  background: white;
  margin: 64px 0 64px 0;

  > * {
    margin: 0 64px 0 64px;
  }
`;
