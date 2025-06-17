import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import { App } from 'app';
import { configureAppStore } from 'store/configureStore';
// import reportWebVitals from 'reportWebVitals';

import 'sanitize.css/sanitize.css';
import 'carbon-components-react/index.scss';

import '@esri/calcite-components/dist/calcite/calcite.css';
import '@esri/calcite-components/dist/components/calcite-select';
import '@esri/calcite-components/dist/components/calcite-option';
import '@esri/calcite-components/dist/components/calcite-button';
import '@esri/calcite-components/dist/components/calcite-input';
import '@esri/calcite-components/dist/components/calcite-switch';
import '@esri/calcite-components/dist/components/calcite-checkbox';
import '@esri/calcite-components/dist/components/calcite-dropdown';
import '@esri/calcite-components/dist/components/calcite-dropdown-group';
import '@esri/calcite-components/dist/components/calcite-dropdown-item';
import '@esri/calcite-components/dist/components/calcite-tree';
import '@esri/calcite-components/dist/components/calcite-tree-item';
import '@esri/calcite-components/dist/components/calcite-tooltip';

import { setAssetPath } from '@esri/calcite-components/dist/components';
setAssetPath('https://js.arcgis.com/calcite-components/1.4.2/assets');

const store = configureAppStore();
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>,
);

// to log results (for example: reportWebVitals(console.log))
// reportWebVitals();
