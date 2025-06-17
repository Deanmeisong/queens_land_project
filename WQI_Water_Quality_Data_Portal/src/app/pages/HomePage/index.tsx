import * as React from 'react';
import Layout from '../../components/layout';
import styled from 'styled-components';
import { Footer } from './elements/footer';
import { Navbar } from './elements/navbar';
import { BlueParagraph } from './elements/blueparagraph';
import { IntroductionParagraph } from './elements/intoparagraph';

export function HomePage() {
  return (
    <Layout>
      <Navbar />
      <BlueParagraph />
      <IntroductionParagraph />
      <Footer />
    </Layout>
  );
}
