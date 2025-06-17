import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Home from '@arcgis/core/widgets/Home.js';
import EsriDESConfig from './appConfig';
import { useDispatch, useSelector } from 'react-redux';
import { useESRIDataSlice } from './slice';
import { selectLocationsTree } from './slice/selectors';

export default function ESRI({ RightSideBarState }) {
  const dispatch = useDispatch();
  const { actions } = useESRIDataSlice();

  const mapDiv = useRef(null);
  const locationsTree = useSelector(selectLocationsTree);

  useEffect(() => {
    if (mapDiv.current) {
      const webmap = new WebMap({
        portalItem: {
          id: EsriDESConfig.WebMap,
        },
      });

      const view = new MapView({
        container: mapDiv.current,
        map: webmap,
      });

      let homeWidget = new Home({
        view: view,
      });
      view.ui.add(homeWidget, 'top-left');

      webmap
        .load()
        .then(function () {
          // ***** load the basemap to get its layers created *****
          return webmap.basemap.load();
        })
        .then(function () {
          // ***** grab all the layers and load them *****
          const allLayers = webmap.allLayers;
          const promises = allLayers.map(function (layer) {
            return layer.load();
          });
          return Promise.all(promises.toArray());
        })
        .then(function (layers) {
          // dispatch(actions.setLayersLoadedFlag(true));
          const sitesLayer = layers.filter(l =>
            l.title.toLowerCase().includes('site'),
          );
          sitesLayer.forEach(
            l => (l.definitionExpression = `Site_Owner like '%WQI%'`),
          );
        });
      view.when(() => {
        view.on('click', async function (event) {
          const layersView: any = view && view.layerViews;
          const tree: any = locationsTree!.childNodes;
          const sitesLayer = layersView.items.filter(l =>
            l.layer.title.toLowerCase().includes('site'),
          );
          const basinsLayer = layersView.items.filter(l =>
            l.layer.title.toLowerCase().includes('basin'),
          );
          const regionsLayer = layersView.items.filter(l =>
            l.layer.title.toLowerCase().includes('regions'),
          );

          const geom = event.mapPoint;
          let resultsFound = false;

          if (!regionsLayer[0].visibleAtCurrentScale) {
            const sitesQuery = sitesLayer[0].createQuery();
            sitesQuery.spatialRelationship = 'intersects';
            sitesQuery.distance = 120;
            sitesQuery.geometry = geom;
            sitesQuery.returnGeometry = false;
            const clickedSites = await sitesLayer[0].layer.queryObjectIds(
              sitesQuery,
            );
            if (clickedSites.length > 0) {
              resultsFound = true;
              const clickedSiteNode: any = Array.from(
                locationsTree!.querySelectorAll(
                  `calcite-tree-item[item-i-d="site_${clickedSites[0]}"]`,
                ),
              ).filter((i: any) => i.style.display !== 'none');
              if (clickedSiteNode.length > 0)
                clickedSiteNode[0].onClick(new CustomEvent('click'));
            } else if (basinsLayer[0].visibleAtCurrentScale) {
              const bainsQuery = basinsLayer[0].createQuery();
              bainsQuery.outFields =
                EsriDESConfig.FeatureLayers.basins.QueryOutputFields;
              bainsQuery.spatialRelationship = 'intersects';
              bainsQuery.geometry = geom;
              bainsQuery.returnGeometry = false;
              const clickedBasins = await basinsLayer[0].layer.queryFeatures(
                bainsQuery,
              );
              if (clickedBasins.features.length > 0) {
                resultsFound = true;
                const containingRegionNode: any[] = Array.from(tree).filter(
                  (i: any) =>
                    // i.itemID.replace('region_', '').replace(/\s+/g, '-') ===
                    i.itemID.replace('region_', '') ===
                    clickedBasins.features[0].attributes[
                      EsriDESConfig.FeatureLayers.regions.QueryOutputFields[0]
                    ],
                  // ].replace(/\s+/g, '-'),
                );
                if (containingRegionNode.length > 0) {
                  const basinsNode: any =
                    containingRegionNode[0].querySelector(
                      'calcite-tree',
                    ).children;

                  const basinTreeItem: any = Array.from(basinsNode)
                    .filter((i: any) =>
                      i.itemID.includes(
                        clickedBasins.features[0].attributes[
                          EsriDESConfig.FeatureLayers.basins
                            .QueryOutputFields[0]
                          // ].replace(/\s+/g, '-'),
                        ],
                      ),
                    )
                    .filter((i: any) => i.style.display !== 'none');
                  if (basinTreeItem && basinTreeItem.length > 0) {
                    basinTreeItem[0].onClick(new CustomEvent('click'));
                  }
                }
              }
            }
          }
          if (regionsLayer[0].visibleAtCurrentScale && !resultsFound) {
            const regionQuery = regionsLayer[0].createQuery();
            regionQuery.outFields =
              EsriDESConfig.FeatureLayers.regions.QueryOutputFields;
            regionQuery.spatialRelationship = 'intersects';
            regionQuery.geometry = geom;
            regionQuery.returnGeometry = false;
            const clickedRegion = await regionsLayer[0].layer.queryFeatures(
              regionQuery,
            );
            if (clickedRegion.features.length > 0) {
              const regionNode: any[] = Array.from(tree)
                .filter(
                  (i: any) =>
                    // i.itemID.replace('region_', '').replace(/\s+/g, '-') ===
                    i.itemID.replace('region_', '') ===
                    clickedRegion.features[0].attributes[
                      EsriDESConfig.FeatureLayers.regions.QueryOutputFields[0]
                      // ].replace(/\s+/g, '-'),
                    ],
                )
                .filter((i: any) => i.style.display !== 'none');
              if (regionNode && regionNode.length > 0) {
                regionNode[0].onClick(new CustomEvent('click'));
              }
            }
          }
        });

        dispatch(actions.mapLoaded(view));
        dispatch(actions.setInitialExtent(view.extent.extent));
      });
    }
  }, [locationsTree, actions, dispatch]);

  return (
    <>
      <MapContainer
        className="viewDiv"
        ref={mapDiv}
        style={{
          width: RightSideBarState
            ? 'calc(100vw - 800px)'
            : 'calc(100vw - 400px)',
        }}
      />
    </>
  );
}

const MapContainer = styled.div`
  display: flex;
  height: inherit;
  border: 0;
  -webkit-transition: width 0.3s ease-in-out;
  -moz-transition: width 0.3s ease-in-out;
  -o-transition: width 0.3s ease-in-out;
  transition: width 0.3s ease-in-out;
`;
