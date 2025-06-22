import * as React from 'react';
import Layout from '../../components/layout';
import { Navbar } from '../HomePage/elements/navbar';
import { Footer } from '../HomePage/elements/footer';
import { AnalysisDownloadContent } from './elements/AnalysisDownloadContent';

export function AnalysisDownload() {
  return (
    <Layout>
      <Navbar />
      <AnalysisDownloadContent />
      <Footer />
    </Layout>
  );
}
