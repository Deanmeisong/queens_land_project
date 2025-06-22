/**
 * Asynchronously loads the component for AnalysisDownload
 */

import { lazyLoad } from 'utils/loadable';

export const AnalysisDownload = lazyLoad(
  () => import('./index'),
  module => module.AnalysisDownload,
);
