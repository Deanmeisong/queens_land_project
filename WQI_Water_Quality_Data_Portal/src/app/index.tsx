import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { GlobalStyle } from 'styles/global-styles';

import { HomePage } from './pages/HomePage/Loadable';
import { AboutData } from './pages/AboutData/Loadable';
import { Map } from './pages/Map/Loadable';
import { AnalysisDownload } from './pages/AnalysisDownload/Loadable';
import { NotFoundPage } from './components/NotFoundPage/Loadable';

import esriConfig from '@arcgis/core/config';
import { useEffect, useState } from 'react';

import EsriDESConfig from './components/esri/appConfig';

export const useBeforeRender = (callback: any, deps: any) => {
  const [isRun, setIsRun] = useState(false);

  if (!isRun) {
    callback();
    setIsRun(true);
  }

  useEffect(() => () => setIsRun(false), deps);
};

export function App() {
  esriConfig.apiKey = EsriDESConfig.PortalToken;

  useBeforeRender(() => {
    window.addEventListener('error', e => {
      if (e) {
        const resizeObserverErrDiv = document.getElementById(
          'webpack-dev-server-client-overlay-div',
        );
        const resizeObserverErr = document.getElementById(
          'webpack-dev-server-client-overlay',
        );
        if (resizeObserverErr)
          resizeObserverErr.className = 'hide-resize-observer';
        if (resizeObserverErrDiv)
          resizeObserverErrDiv.className = 'hide-resize-observer';
      }
    });
  }, []);

  return (
    <BrowserRouter basename="/water-data-portal">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutData />} />
        <Route path="/map" element={<Map />} />
        <Route path="/analysis-download" element={<AnalysisDownload />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <GlobalStyle />
    </BrowserRouter>
  );
}
