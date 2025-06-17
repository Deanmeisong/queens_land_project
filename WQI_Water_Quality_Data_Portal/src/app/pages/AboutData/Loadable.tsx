/**
 * Asynchronously loads the component for HomePage
 */

import { lazyLoad } from 'utils/loadable';

export const AboutData = lazyLoad(
  () => import('./index'),
  module => module.AboutData,
);
