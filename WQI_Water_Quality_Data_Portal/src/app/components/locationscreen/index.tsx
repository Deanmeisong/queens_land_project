import XIcon from 'calcite-ui-icons-react/XIcon';
import styled from 'styled-components';
import FeatureEffect from '@arcgis/core/layers/support/FeatureEffect';
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter';
import React, { useEffect, useRef, useState } from 'react';
import { Screens } from '../leftbar';
import { useDispatch, useSelector } from 'react-redux';
import { useESRIDataSlice } from '../esri/slice';
import { CalciteInputCustomEvent } from '@esri/calcite-components';
import {
  CalciteButton,
  CalciteInput,
  CalciteTree,
  CalciteTreeItem,
} from '@esri/calcite-components-react';
import {
  selectInitExtent,
  selectMap,
  selectSites,
  selectInternalSitesOIDs,
  selectExternalDataFlag,
  selectLayersLoadedFlag,
  selectRegions,
} from '../esri/slice/selectors';

export default function LocationScreen({
  showingComponent,
  setShowingComponent,
}) {
  const dispatch = useDispatch();
  const { actions } = useESRIDataSlice();

  const treeRef = useRef<HTMLCalciteTreeElement>(null);
  const searchRef = useRef<HTMLCalciteInputElement>(null);
  const choiceCleaner = useRef<HTMLCalciteButtonElement>(null);

  const map = useSelector(selectMap);
  const sites = useSelector(selectSites);
  const initExt = useSelector(selectInitExtent);
  const regionsTable = useSelector(selectRegions);
  const externalDataFlag = useSelector(selectExternalDataFlag);
  const internalSitesOIDs = useSelector(selectInternalSitesOIDs);
  const layersLoadedIndicator = useSelector(selectLayersLoadedFlag);

  const [selectedSites, setSelectedSites] = useState([]);
  const [filteredTreeItems, setFilteredTreeItems]: Array<any> = useState([]);

  useEffect(() => {
    // TODO: Check if already in store
    dispatch(actions.setChoiceCleanerSites(choiceCleaner.current));
  }, [choiceCleaner, dispatch, actions]);

  // ***** 3rd-party data logic *****
  useEffect(() => {
    const layersView: any = map && map?.layerViews;
    if (layersView) {
      const sitesLayer = layersView.items.filter(l =>
        l.layer.title.toLowerCase().includes('site'),
      );

      const regionsTreeNode: HTMLCollection = treeRef.current!.children;

      const allSiteNodes: any = Array.from(
        treeRef.current!.querySelectorAll('calcite-tree-item[item-i-d*=site_]'),
      );
      if (externalDataFlag && treeRef.current) {
        const extSites = allSiteNodes.filter(
          s => !internalSitesOIDs.map(f => `site_${f}`).includes(s.itemID),
        );
        extSites.forEach(s => (s.style.display = 'unset'));
        sitesLayer.forEach(l => (l.layer.definitionExpression = null));
      } else {
        const extSites = allSiteNodes.filter(
          s => !internalSitesOIDs.map(f => `site_${f}`).includes(s.itemID),
        );
        extSites.forEach(s => (s.style.display = 'none'));

        sitesLayer.forEach(
          l => (l.layer.definitionExpression = "Site_Owner like '%WQI%'"),
        );
      }
      Array.from(regionsTreeNode).forEach((region: any) => {
        const basins: HTMLCollection = region.children[0].children;
        Array.from(basins).forEach((basin: any) => {
          if (
            Array.from(basin.children[0].children).filter(
              (i: any) => i.style.display !== 'none',
            ).length <= 0
          ) {
            basin.style.display = 'none';
          } else {
            basin.style.display = 'unset';
          }
        });
        if (
          Array.from(region.children[0].children).filter(
            (i: any) => i.style.display !== 'none',
          ).length <= 0
        ) {
          region.style.display = 'none';
        } else {
          region.style.display = 'unset';
        }
      });
    }
  }, [
    externalDataFlag,
    treeRef,
    map,
    internalSitesOIDs,
    layersLoadedIndicator,
  ]);

  useEffect(() => {
    // TODO: Check if already in store
    dispatch(actions.setLocationsTree(treeRef.current));
  }, [treeRef, actions, dispatch]);

  useEffect(() => {
    if (choiceCleaner) {
      if (selectedSites.length > 0) {
        choiceCleaner.current!.disabled = false;
      } else {
        choiceCleaner.current!.disabled = true;
      }
    }

    // ***** MAP selection filters *****
    if (map && selectedSites) {
      const layersView: any = map && map?.layerViews;
      const regionsLayer = layersView.items.filter(l =>
        l.layer.title.toLowerCase().includes('regions'),
      );
      const sitesLayer = layersView.items.filter(l =>
        l.layer.title.toLowerCase().includes('site'),
      );
      const basinsLayer = layersView.items.filter(l =>
        l.layer.title.toLowerCase().includes('basin'),
      );

      if (regionsLayer && regionsLayer.length > 0) {
        if (selectedSites.length > 0) {
          const queryObj = regionsLayer[0].createQuery();
          queryObj.outFields = ['*'];
          let siteOID: any = selectedSites.filter((s: string) =>
            s.includes('site_'),
          );
          let basins: any = selectedSites
            .filter((s: string) => s.includes('basin_'))
            .map((s: string) => s.replace('site_', ''));
          const parsedSiteOID = siteOID.map(s =>
            Number(s.replace('site_', '')),
          );
          const selectedSitesRegions = Array.from(
            new Set(
              sites
                .filter(s => parsedSiteOID.includes(s.ObjectId))
                .map(s => `'${s.Region.replace(`'`, `''`)}'`),
            ),
          );

          const whereStatement_Sites = `Region in (${selectedSitesRegions.join(
            ', ',
          )})`;
          sitesLayer.forEach(
            s => (s.layer.definitionExpression = whereStatement_Sites),
          );
          const clusteredLayer = sitesLayer.filter(
            l => l.layer.featureReduction,
          );

          if (clusteredLayer) {
            clusteredLayer[0].layer.definitionExpression = `ObjectId in (${siteOID
              .map(s => Number(s.replace('site_', '')))
              .join(', ')})`;
          }

          const pointsLayer = sitesLayer.filter(l => !l.layer.featureReduction);
          if (pointsLayer)
            pointsLayer[0].layer.featureEffect = new FeatureEffect({
              filter: new FeatureFilter({
                where: `ObjectId in (${siteOID
                  .map(s => Number(s.replace('site_', '')))
                  .join(', ')})`,
              }),
              includedEffect:
                'bloom(2.5 0pt 0) brightness(6) hue-rotate(50deg)',
              // excludedEffect: 'blur(4px) brightness(1.2) grayscale(0.8)',
            });

          const whereStatement_Regions = `NRM_Region in (${selectedSitesRegions.join(
            ', ',
          )})`;
          queryObj.where = whereStatement_Regions;
          regionsLayer[0].layer.featureEffect = new FeatureEffect({
            filter: new FeatureFilter({
              where: whereStatement_Regions,
            }),
            includedEffect: 'brightness(1.5) drop-shadow(0, 0px, 12px)',
            excludedEffect: 'blur(8px) brightness(1.2) grayscale(0.8)',
          });
          const whereStatement_Basins = `RepReg in (${basins
            .map(
              b => `'${b.replace('basin_', '').replace(`'`, `''`)}'`,
              // .replace(/\-+/g, ' ')}'`,
            )
            .join(', ')})`;

          basinsLayer[0].layer.featureEffect = new FeatureEffect({
            filter: new FeatureFilter({
              where: whereStatement_Basins,
            }),
            includedEffect: 'brightness(1.5) drop-shadow(0, 0px, 12px)',
            excludedEffect: 'blur(8px) brightness(1.2) grayscale(0.8)',
          });

          dispatch(actions.setSelectedRegion(selectedSitesRegions));

          regionsLayer[0].visibleAtCurrentScale &&
            regionsLayer[0].layer.queryFeatures(queryObj).then(function (res) {
              if (res.features && res.features.length > 0) {
                map
                  .when(async map => {
                    await map.goTo(res.features).catch(function (error) {
                      if (error.name !== 'AbortError') {
                        console.error(error);
                      }
                    });
                  })
                  .catch(function (error) {
                    console.error(error);
                  });
              }
            });
        } else {
          regionsLayer[0].layer.featureEffect = null;
          basinsLayer[0].layer.featureEffect = null;
          sitesLayer.forEach(s => {
            s.layer.definitionExpression = externalDataFlag
              ? null
              : "Site_Owner like '%WQI%'";
            s.layer.featureEffect = null;
          });
          regionsLayer[0].visibleAtCurrentScale &&
            map
              .when(async map => {
                await map.goTo(initExt).catch(function (error) {
                  if (error.name !== 'AbortError') {
                    console.error(error);
                  }
                });
              })
              .catch(function (error) {
                console.error(error);
              });
        }
      }
    }
  }, [
    map,
    selectedSites,
    sites,
    actions,
    dispatch,
    initExt,
    choiceCleaner,
    externalDataFlag,
  ]);

  function choiceCleanerHandler() {
    treeRef.current?.selectedItems
      .filter((i: any) => i.itemID.includes('site_'))
      .forEach((i: any) => {
        i.parentTreeItem.parentTreeItem.indeterminate = false;
        i.parentTreeItem.indeterminate = false;
      });
    treeRef.current?.selectedItems.forEach((i: any) => (i.selected = false));
    treeRef.current!.selectedItems = [];

    setSelectedSites([]);
    dispatch(actions.setSelectedSites([]));
  }

  function regionChooser() {
    if (choiceCleaner) {
      if (selectedSites.length > 0) {
        choiceCleaner.current!.disabled = false;
      } else {
        choiceCleaner.current!.disabled = true;
      }
    }
  }

  // ***** Save selected sites to store *****
  function handleChoice(evt) {
    const parsedSelectedSites = evt.target.selectedItems
      .filter(i => i.itemID && i.style.display !== 'none')
      .map(s => s.itemID)
      .filter(i => i.includes('site_') || i.includes('basin_'));

    evt.target.selectedItems.forEach(
      s =>
        s.parentTreeItem &&
        s.parentTreeItem.indeterminate &&
        (s.parentTreeItem.itemID.includes('basin_') ||
          (s.parentTreeItem.itemID.includes('region_') &&
            s.parentTreeItem.style.display !== 'none')) &&
        parsedSelectedSites.push(s.parentTreeItem.itemID),
    );

    setSelectedSites(parsedSelectedSites);
    dispatch(actions.setSelectedSites(parsedSelectedSites));
  }

  // ***** Data prep for tree *****
  // TODO: Into a state and make sure it happens only once
  const regionsExtraction = sites
    .map(item => item.Region)
    .filter((value, index, self) => self.indexOf(value) === index);

  const sortedRegionsSource = regionsTable
    .map(i => [i.NRM_Region, i.Reg_Order])
    .sort((a: any, b: any) => a[1] - b[1]);
  const newRegionsArray = regionsExtraction.map((itm: string) => [
    itm,
    sortedRegionsSource.map(i => i[0]).indexOf(itm),
  ]);
  const regions: string[] = newRegionsArray
    .sort((a: any, b: any) => a[1] - b[1])
    .map((r: any[]): string => r[0]);

  const basinsPerRegion = {};
  sites &&
    sites.length > 0 &&
    regions.forEach(
      r =>
        (basinsPerRegion[r] = new Set(
          sites.filter(s => s.Region === r).map(b => b.Basin),
        )),
    );

  // ALL BASINS + SITES
  const basins = new Set(sites.map(item => `${item.Region};${item.Basin}`));
  const sitesPerBasin = {};
  basins.forEach(b => {
    const val = b.split(';');
    sitesPerBasin[b] = sites
      .map(s => ({
        Region: s.Region,
        Basin: s.Basin,
        Site_Name: s.Site_Name,
        ObjectId: s.ObjectId,
      }))
      .filter(s => s.Region === val[0] && s.Basin === val[1]);
  });

  // ***** Search logic *****
  const textInputChanged = (evt: CalciteInputCustomEvent<void>) => {
    const searchVal = evt.target.value;
    const regions: HTMLCollection = treeRef.current!.children;

    let itemsToRemove: any = [];
    filteredTreeItems.forEach(i => {
      if (
        searchVal === '' ||
        (i.itemID.includes('site_') &&
          i.textContent.toLowerCase().includes(searchVal.toLowerCase()) &&
          i.style.display !== 'none')
      ) {
        i.style.display = 'unset';
        itemsToRemove.push(i);
      }
    });
    itemsToRemove.forEach(i =>
      setFilteredTreeItems(prev => (prev.pop(i) || []) && [...prev]),
    );

    if (searchVal !== '') {
      Array.from(regions).forEach((region: any) => {
        const basins: HTMLCollection = region.children[0].children;
        let includeThisRegion = false;

        Array.from(basins).forEach((basin: any) => {
          let sites: any[] = basin.children[0].children;
          let includeThisBasin = false;
          if (!externalDataFlag) {
            sites = Array.from(sites).filter((s: any) =>
              internalSitesOIDs.includes(Number(s.itemID.replace('site_', ''))),
            );
          }
          if (sites.length > 0) {
            includeThisBasin = true;
            includeThisRegion = true;
          }

          Array.from(sites).forEach((site: any) => {
            if (
              !site.textContent!.toLowerCase().includes(searchVal.toLowerCase())
            ) {
              if (site.style.display !== 'none') {
                site.style.display = 'none';
                !filteredTreeItems.includes(site) &&
                  setFilteredTreeItems(i => [...i, site]);
              }
            } else if (
              site.textContent!.toLowerCase().includes(searchVal.toLowerCase())
            ) {
              if (site.style.display === 'none') {
                site.style.display = 'unset';
                filteredTreeItems.includes(site) &&
                  setFilteredTreeItems(i => (i.pop(site) || []) && [...i]);
              }
            }
          });
          if (
            includeThisBasin &&
            Array.from(basin.children[0].children).filter(
              (i: any) => i.style.display !== 'none',
            ).length <= 0
          ) {
            basin.style.display = 'none';
            !filteredTreeItems.includes(basin) &&
              setFilteredTreeItems(i => [...i, basin]);
          } else if (
            includeThisBasin &&
            basin
              .textContent!.toLowerCase()
              .includes(searchVal.toLowerCase()) &&
            region.style.display === 'none'
          ) {
            basin.style.display = 'unset';
            filteredTreeItems.includes(basin) &&
              setFilteredTreeItems(i => (i.pop(basin) || []) && [...i]);
          }
        });
        if (
          includeThisRegion &&
          Array.from(region.children[0].children).filter(
            (i: any) => i.style.display !== 'none',
          ).length <= 0
        ) {
          region.style.display = 'none';
          !filteredTreeItems.includes(region) &&
            setFilteredTreeItems(i => [...i, region]);
        } else if (
          includeThisRegion &&
          region.textContent!.toLowerCase().includes(searchVal.toLowerCase()) &&
          region.style.display === 'none'
        ) {
          region.style.display = 'unset';
          filteredTreeItems.includes(region) &&
            setFilteredTreeItems(i => (i.pop(region) || []) && [...i]);
        }
      });
    }
  };

  function handleClose() {
    setShowingComponent(Screens.Search);
  }
  return (
    <SideBar
      key="locations"
      className={showingComponent === Screens.Locations ? 'showDiv' : 'hideDiv'}
    >
      <TitleSection>
        <h2 className="SectionTitle" style={{ margin: '0px' }}>
          Select location
        </h2>
        <CalciteButton appearance="transparent" onClick={handleClose}>
          <XIcon size={32} color="#008635" onClick={handleClose}></XIcon>
        </CalciteButton>
      </TitleSection>
      <CalciteInput
        onCalciteInputChange={textInputChanged}
        ref={searchRef}
        // value={username}
        id="CalciteInput"
        alignment="start"
        icon="search"
        type="search"
        placeholder="Type and search"
        scale="l"
      ></CalciteInput>
      <LeftSideBar
        style={{
          maxHeight: `calc(100vh - 460px)`,
        }}
      >
        <CalciteTree
          ref={treeRef}
          scale="l"
          selection-mode="ancestors"
          onCalciteTreeSelect={handleChoice}
        >
          {regions &&
            regions.length > 0 &&
            regions.map(r => (
              <CalciteTreeItem
                onClick={regionChooser}
                itemID={`region_${r}`}
                key={r}
              >
                {r.replace(/\-+/g, ' ')}
                {Object.keys(basinsPerRegion).length > 0 && (
                  <CalciteTree slot="children">
                    {Object.keys(basinsPerRegion).length > 0 &&
                      r in basinsPerRegion &&
                      Array.from(basinsPerRegion[r])
                        .sort()
                        .map((b: any) => (
                          <CalciteTreeItem
                            itemID={`basin_${b}`}
                            key={`basin_${r}-${b}`}
                          >
                            {b.replace(/\-+/g, ' ') || 'error'}
                            {`${r};${b}` in sitesPerBasin &&
                              Object.keys(sitesPerBasin).length > 0 &&
                              `${r};${b}` in sitesPerBasin &&
                              `${r};${b}` in sitesPerBasin &&
                              Array.from(sitesPerBasin[`${r};${b}`]).length >
                                0 && (
                                <CalciteTree slot="children">
                                  {`${r};${b}` in sitesPerBasin &&
                                    Array.from(sitesPerBasin[`${r};${b}`])
                                      .sort((a: any, b: any) =>
                                        a.Site_Name.localeCompare(b.Site_Name),
                                      )
                                      .map((s: any) => (
                                        <CalciteTreeItem
                                          itemID={`site_${s.ObjectId}`}
                                          key={`site_${s.ObjectId}-${r.replace(
                                            ' ',
                                            '-',
                                          )}-${b}`}
                                        >
                                          {s.Site_Name}
                                        </CalciteTreeItem>
                                      ))}
                                </CalciteTree>
                              )}
                          </CalciteTreeItem>
                        ))}
                  </CalciteTree>
                )}
              </CalciteTreeItem>
            ))}
        </CalciteTree>
      </LeftSideBar>
      <BottomButtons>
        <CalciteButton
          ref={choiceCleaner}
          scale="l"
          appearance="transparent"
          onClick={choiceCleanerHandler}
        >
          Clear filters
        </CalciteButton>
      </BottomButtons>
    </SideBar>
  );
}

const BottomButtons = styled.div`
  margin-bottom: -20px !important;
  display: flex;
  position: absolute;
  bottom: 24px;
  justify-content: space-between;
  width: -webkit-fill-available;
`;
const TitleSection = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: space-between;
  align-items: center;
`;
const LeftSideBar = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  margin: 20px 0 24px 0;
  -webkit-transition: all 0.3s ease-in-out;
  -moz-transition: all 0.3s ease-in-out;
  -o-transition: all 0.3s ease-in-out;
  transition: all 0.3s ease-in-out;

  &::-webkit-scrollbar {
    width: 9px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f5f5f5;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e0e0e0;
    border-radius: 10px;
  }
`;

const SideBar = styled.div`
  padding: 1.5rem 2rem 1.5rem 4rem;
  height: calc(100vh - 240px);

  > * {
    margin-bottom: 24px;
  }
`;
