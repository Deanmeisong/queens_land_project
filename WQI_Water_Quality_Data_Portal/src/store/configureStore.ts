/**
 * Create the store with dynamic reducers
 */

import { configureStore, StoreEnhancer } from '@reduxjs/toolkit';
import { createInjectorsEnhancer } from 'redux-injectors';
import createSagaMiddleware from 'redux-saga';

import { createReducer } from './reducers';

export function configureAppStore() {
  const reduxSagaMonitorOptions = {};
  const sagaMiddleware = createSagaMiddleware(reduxSagaMonitorOptions);
  const { run: runSaga } = sagaMiddleware;

  // Create the store with saga middleware
  const middlewares = [sagaMiddleware];

  const enhancers = [
    createInjectorsEnhancer({
      createReducer,
      runSaga,
    }),
  ] as StoreEnhancer[];

  const store = configureStore({
    reducer: createReducer(),
    middleware: defaultMiddleware => [
      ...defaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            'esriData/mapLoaded',
            'esriData/setInitialExtent',
            'esriData/setLocationsTree',
            'esriData/setChoiceCleaner',
            'esriData/setReportsState',
            'esriData/loadInternalSitesOIDs',
            'esriData/setDownloadBtn',
            'esriData/loadReportData',
            'esriData/setAnalytePerGroupObj',
            'esriData/setSelectedDateRangeOption',
            'esriData/dataLoaded',
            'esriData/setDatesOptionsBtn',
            'esriData/setChoiceCleanerSites',
            'esriData/setAnalytePerGroupObj',
            'esriData/loadReportsState',
            'esriData/loadReportsData',
            'esriData/setChoiceCleanerAnalytes',
            'esriData/setDatesOptionsVal',
          ],
          ignoredPaths: [
            'esriData.map',
            'esriData.choiceCleanerBtnSites',
            'esriData.choiceCleanerBtnAnalytes',
            'esriData.initialExtent',
            'esriData.locationsTree',
            'esriData.choiceCleanerBtn',
            'esriData.reportsState',
            'esriData.reportsData',
            'esriData.downloadBtn',
            'esriData.analytePerGroupObj',
            'esriData.selectedDateRange',
            'esriData.datesOptionsBtn',
            'esriData.datesOptionsVal',
          ],
        },
      }),
      ...middlewares,
    ],
    devTools: process.env.NODE_ENV !== 'production',
    enhancers,
  });

  return store;
}
