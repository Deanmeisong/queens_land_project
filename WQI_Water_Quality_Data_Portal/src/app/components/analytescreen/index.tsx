import styled from 'styled-components';
import XIcon from 'calcite-ui-icons-react/XIcon';
import React, { useEffect, useRef, useState } from 'react';
import { Screens } from '../leftbar';
import { useDispatch, useSelector } from 'react-redux';
import { useESRIDataSlice } from '../esri/slice';
import {
  selectAnalytes,
  selectAnalytesOrderTable,
} from '../esri/slice/selectors';
import { CalciteInputCustomEvent } from '@esri/calcite-components';
import EsriDESConfig from '../esri/appConfig';
import {
  CalciteButton,
  CalciteInput,
  CalciteTree,
  CalciteTreeItem,
} from '@esri/calcite-components-react';

export default function AnalyteScreen({
  showingComponent,
  setShowingComponent,
}) {
  const dispatch = useDispatch();
  const { actions } = useESRIDataSlice();

  const treeRef = useRef<HTMLCalciteTreeElement>(null);
  const searchRef = useRef<HTMLCalciteInputElement>(null);
  const choiceCleaner = useRef<HTMLCalciteButtonElement>(null);

  const [analyteGroups, setAnalyteGroups] = useState<Array<any>>([]);
  const [analytePerGroup, setAnalytePerGroup] = useState<Object>({});
  const [selectedAnalytes, setSelectedAnalytes] = useState([]);
  const [filteredTreeItems, setFilteredTreeItems]: Array<any> = useState([]);

  const analytes = useSelector(selectAnalytes);
  const analytesOrderTable = useSelector(selectAnalytesOrderTable);

  useEffect(() => {
    // TODO: Check if already in store
    dispatch(actions.setChoiceCleanerAnalytes(choiceCleaner.current));
  }, [choiceCleaner, dispatch, actions]);

  useEffect(() => {
    if (choiceCleaner) {
      if (selectedAnalytes.length > 0) {
        choiceCleaner.current!.disabled = false;
      } else {
        choiceCleaner.current!.disabled = true;
      }
    }
  }, [analytes, choiceCleaner, selectedAnalytes]);

  // ***** Data prep for tree *****
  useEffect(() => {
    if (analyteGroups.length <= 0 && analytesOrderTable.length > 0) {
      const analytePerGroupObj = {};

      const analytePrimaryGroups = new Set(
        analytes.map(a => a.primary_analyte_group).filter(a => a),
      );
      const analyteSecondaryGroups = new Set(
        analytes.map(a => a.secondary_analyte_group).filter(a => a),
      );
      const analyteGroupsObjTemp = [
        ...Array.from(analyteSecondaryGroups),
        ...Array.from(analytePrimaryGroups).sort(),
      ];

      const sortedAnalytesSource = analytesOrderTable
        .map(i => [i.primary_analyte_group, i.analyte_order])
        .sort((a: any, b: any) => a[1] - b[1]);
      const newAnalytesArray = analyteGroupsObjTemp.map((itm: string) => [
        itm,
        sortedAnalytesSource.map(i => i[0]).indexOf(itm),
      ]);
      const analyteGroupsObj = newAnalytesArray
        .sort((a: any, b: any) => a[1] - b[1])
        .map((r: any[]): string => r[0]);

      analyteGroupsObj.forEach(ag => {
        const arrayResults = new Set(
          analytes
            .filter(a => a.primary_analyte_group === ag)
            .map(a => a.generic_name),
        );
        if (arrayResults && Array.from(arrayResults).length > 0) {
          analytePerGroupObj[ag] = arrayResults;
        }
      });
      analyteGroupsObj.forEach(ag => {
        const arrayResults = new Set(
          analytes
            .filter(a => a.secondary_analyte_group === ag)
            .map(a => a.generic_name),
        );
        if (arrayResults && Array.from(arrayResults).length > 0) {
          analytePerGroupObj[ag] = arrayResults;
        }
      });
      if (analytePerGroupObj && Object.keys(analytePerGroupObj).length > 0) {
        setAnalyteGroups(analyteGroupsObj);
        setAnalytePerGroup(analytePerGroupObj);
        dispatch(actions.setAnalytePerGroupObj(analytePerGroupObj));
      }
    }
  }, [
    analytePerGroup,
    setAnalytePerGroup,
    analytes,
    analyteGroups,
    dispatch,
    actions,
    analytesOrderTable,
  ]);

  function handleChoice(evt) {
    const parsedSelectedAnalytes = evt.target.selectedItems
      .filter(i => i.itemID)
      .map(s => s.itemID)
      .filter(i => i.includes('analyte_'));

    setSelectedAnalytes(parsedSelectedAnalytes);
    dispatch(actions.setSelectedAnalytes(parsedSelectedAnalytes));

    let pesticidesAnalyteChoice = false;
    parsedSelectedAnalytes.forEach(analyte => {
      if (
        !pesticidesAnalyteChoice &&
        Array.from(analytePerGroup[EsriDESConfig.UniqueAnalyteGroup]).includes(
          analyte.replace('analyte_', ''),
        )
      ) {
        pesticidesAnalyteChoice = true;
      }
    });
    dispatch(actions.setPesticidesAnalyteChoice(pesticidesAnalyteChoice));
    dispatch(actions.calculateReportCards());
  }

  function choiceCleanerHandler() {
    treeRef
      .current!.selectedItems.filter((i: any) => i.itemID.includes('analyte_'))
      .forEach((i: any) => {
        i.parentTreeItem.indeterminate = false;
      });
    treeRef.current!.selectedItems.forEach((i: any) => (i.selected = false));
    treeRef.current!.selectedItems = [];

    setSelectedAnalytes([]);
    dispatch(actions.setSelectedAnalytes([]));
  }

  // ***** Search logic *****
  const textInputChanged = (evt: CalciteInputCustomEvent<void>) => {
    const searchVal = evt.target.value;
    const analyteGroups: HTMLCollection = treeRef.current!.children;

    let itemsToRemove: any = [];
    filteredTreeItems.forEach(i => {
      if (
        searchVal === '' ||
        (i.itemID.includes('analyte_') &&
          i.textContent.toLowerCase().includes(searchVal.toLowerCase()))
      ) {
        i.style.display = 'unset';
        itemsToRemove.push(i);
      }
    });
    itemsToRemove.forEach(i =>
      setFilteredTreeItems(prev => (prev.pop(i) || []) && [...prev]),
    );

    if (searchVal !== '') {
      Array.from(analyteGroups).forEach((analyteGroup: any) => {
        const analytes: HTMLCollection = analyteGroup.children[0].children;
        Array.from(analytes).forEach((analyte: any) => {
          if (
            !analyte
              .textContent!.toLowerCase()
              .includes(searchVal.toLowerCase())
          ) {
            analyte.style.display = 'none';
            !filteredTreeItems.includes(analyte) &&
              setFilteredTreeItems(i => [...i, analyte]);
          } else if (
            analyte.textContent!.toLowerCase().includes(searchVal.toLowerCase())
          ) {
            analyte.style.display = 'unset';
            filteredTreeItems.includes(analyte) &&
              setFilteredTreeItems(i => (i.pop(analyte) || []) && [...i]);
          }
        });
        if (
          Array.from(analyteGroup.children[0].children).filter(
            (i: any) => i.style.display !== 'none',
          ).length <= 0
        ) {
          analyteGroup.style.display = 'none';
          !filteredTreeItems.includes(analyteGroup) &&
            setFilteredTreeItems(i => [...i, analyteGroup]);
        } else if (
          analyteGroup
            .textContent!.toLowerCase()
            .includes(searchVal.toLowerCase())
        ) {
          analyteGroup.style.display = 'unset';
          filteredTreeItems.includes(analyteGroup) &&
            setFilteredTreeItems(i => (i.pop(analyteGroup) || []) && [...i]);
        }
      });
    }
  };

  function handleClose() {
    setShowingComponent(Screens.Search);
  }

  return (
    <SideBar
      key="analytes"
      className={showingComponent === Screens.Analytess ? 'showDiv' : 'hideDiv'}
    >
      <TitleSection>
        <h2 className="SectionTitle" style={{ margin: '0px' }}>
          Select analytes
        </h2>
        <CalciteButton appearance="transparent" onClick={handleClose}>
          <XIcon size={32} color="#008635" onClick={handleClose}></XIcon>
        </CalciteButton>
      </TitleSection>
      <CalciteInput
        ref={searchRef}
        onCalciteInputChange={textInputChanged}
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
          {analyteGroups.map(a => (
            <CalciteTreeItem itemID={`analyteGroup_${a}`} key={a}>
              {a}
              {Array.from(analytePerGroup[a]).length > 0 && (
                <CalciteTree slot="children">
                  {Array.from(analytePerGroup[a])
                    .sort()
                    .map((ag: any) => (
                      <CalciteTreeItem
                        itemID={`analyte_${ag}`}
                        key={`${a}-${ag}`}
                      >
                        {ag || 'error'}
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
          onClick={choiceCleanerHandler}
          ref={choiceCleaner}
          scale="l"
          appearance="transparent"
        >
          Clear filters
        </CalciteButton>
      </BottomButtons>
    </SideBar>
  );
}

const BottomButtons = styled.div`
  margin-bottom: -20px !important;
  bottom: 24px;
  display: flex;
  position: absolute;
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
