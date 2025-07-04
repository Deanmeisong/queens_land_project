/**
 * Asynchronously loads the component for HomePage
 */

import { lazyLoad } from 'utils/loadable';

export const Map = lazyLoad(
  () => import('./index'),
  module => module.Map,
);
