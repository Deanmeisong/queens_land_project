import * as React from 'react';
import { useState, useMemo } from 'react';
import styled from 'styled-components';

// Hard-coded data structure based on your CSV
const analysisData = [
  {
    laboratory: 'Queensland Health',
    methods: [
      {
        methodName: 'Metals - soluble',
        genericNames: [
          {
            name: 'Chromium as Cr - soluble',
            data: 'Chromium as Cr - soluble_testing_data',
          },
          {
            name: 'Aluminium as Al - soluble',
            data: 'Aluminium as Al - soluble_testing_data',
          },
        ],
      },
      {
        methodName: 'Metals - total',
        genericNames: [
          {
            name: 'Chromium as Cr - total',
            data: 'Chromium as Cr - total_testing_data',
          },
          {
            name: 'Aluminium as Al - total',
            data: 'Aluminium as Al - total_testing_data',
          },
        ],
      },
      {
        methodName: 'Standard Water Analysis (Surface Water)',
        genericNames: [
          {
            name: 'Total dissolved ions',
            data: 'Total dissolved ions_testing_data',
          },
          {
            name: 'Sodium adsorption ratio',
            data: 'Sodium adsorption ratio_testing_data',
          },
          {
            name: 'Organic carbonate as CO3',
            data: 'Organic carbonate as CO3_testing_data',
          },
          { name: 'Hydroxide as OH', data: 'Hydroxide as OH_testing_data' },
          {
            name: 'Residual alkalinity as Na2CO3',
            data: 'Residual alkalinity as Na2CO3_testing_data',
          },
          {
            name: 'Total alkalinity as CaCO3',
            data: 'Total alkalinity as CaCO3_testing_data',
          },
          { name: 'pH', data: 'pH_testing_data' },
          { name: 'Turbidity', data: 'Turbidity_testing_data' },
          { name: 'Conductivity', data: 'Conductivity_testing_data' },
        ],
      },
      {
        methodName: 'Herbicides Direct Injection',
        genericNames: [
          { name: 'Chlorpyrifos oxon', data: 'Chlorpyrifos oxon_testing_data' },
          { name: 'Chlorpyrifos', data: 'Chlorpyrifos_testing_data' },
          { name: 'Ametryn', data: 'Ametryn_testing_data' },
          { name: 'Amicarbazone', data: 'Amicarbazone_testing_data' },
        ],
      },
      {
        methodName: 'Herbicides, SPE, full list, low level LCMSMS',
        genericNames: [
          { name: 'Chlorpyrifos', data: 'Chlorpyrifos_testing_data' },
        ],
      },
      {
        methodName: 'Pesticides GCMSMS',
        genericNames: [
          { name: 'Chlorpyrifos', data: 'Chlorpyrifos_testing_data' },
          { name: 'Ametryn', data: 'Ametryn_testing_data' },
          { name: 'Amitraz', data: 'Amitraz_testing_data' },
          {
            name: 'Chlorpyrifos-methyl',
            data: 'Chlorpyrifos-methyl_testing_data',
          },
          { name: 'Chlorpyrifos oxon', data: 'Chlorpyrifos oxon_testing_data' },
        ],
      },
      {
        methodName: 'Total Dissolved Phosphorus and Nitrogen',
        genericNames: [
          {
            name: 'Dissolved Kjeldahl phosphorus as P',
            data: 'Dissolved Kjeldahl phosphorus as P_testing_data',
          },
          {
            name: 'Total dissolved nitrogen as N',
            data: 'Total dissolved nitrogen as N_testing_data',
          },
        ],
      },
      {
        methodName: 'Soluble Nutrients',
        genericNames: [
          {
            name: 'Ammonium nitrogen as N',
            data: 'Ammonium nitrogen as N_testing_data',
          },
          {
            name: 'Oxidised nitrogen as N',
            data: 'Oxidised nitrogen as N_testing_data',
          },
        ],
      },
      {
        methodName: 'Total Nutients',
        genericNames: [
          {
            name: 'Total nitrogen as N',
            data: 'Total nitrogen as N_testing_data',
          },
        ],
      },
      {
        methodName: 'Total suspended solids',
        genericNames: [
          {
            name: 'Total suspended solids',
            data: 'Total suspended solids_testing_data',
          },
        ],
      },
    ],
  },
  {
    laboratory: 'Chemistry Centre',
    methods: [
      {
        methodName: 'Partical Size Distribution',
        genericNames: [
          {
            name: 'MECD - <0.24 micrometres (Extremely fine clay)',
            data: 'MECD - <0.24 micrometres (Extremely fine clay)_testing_data',
          },
          {
            name: 'MECD - 0.5 micrometres - 0.24 micrometres (Very fine clay)',
            data: 'MECD - 0.5 micrometres - 0.24 micrometres (Very fine clay)_testing_data',
          },
          {
            name: 'MECD - 1 micrometre - 0.5 micrometres (Fine clay)',
            data: 'MECD - 1 micrometre - 0.5 micrometres (Fine clay)_testing_data',
          },
          {
            name: 'MECD - 2 micrometres - 1 micrometres (Medium clay)',
            data: 'MECD - 2 micrometres - 1 micrometres (Medium clay)_testing_data',
          },
          {
            name: 'MECD - 4 micrometres - 2 micrometres (Coarse clay)',
            data: 'MECD - 4 micrometres - 2 micrometres (Coarse clay)_testing_data',
          },
          {
            name: 'MECD - 8 micrometres - 4 micrometres (Very fine silt)',
            data: 'MECD - 8 micrometres - 4 micrometres (Very fine silt)_testing_data',
          },
          {
            name: 'MECD - 16 micrometres - 8 micrometres (Fine silt)',
            data: 'MECD - 16 micrometres - 8 micrometres (Fine silt)_testing_data',
          },
          {
            name: 'MECD - 31 micrometres - 16 micrometres (Medium silt)',
            data: 'MECD - 31 micrometres - 16 micrometres (Medium silt)_testing_data',
          },
          {
            name: 'MECD - 62 micrometres - 31 micrometres (Coarse silt)',
            data: 'MECD - 62 micrometres - 31 micrometres (Coarse silt)_testing_data',
          },
          {
            name: 'MECD - 125 micrometres - 62 micrometres (Very fine sand)',
            data: 'MECD - 125 micrometres - 62 micrometres (Very fine sand)_testing_data',
          },
          {
            name: 'MECD - 250 micrometres - 125 micrometres (Fine sand)',
            data: 'MECD - 250 micrometres - 125 micrometres (Fine sand)_testing_data',
          },
          {
            name: 'MECD - 500 micrometres - 250 micrometres (Medium sand)',
            data: 'MECD - 500 micrometres - 250 micrometres (Medium sand)_testing_data',
          },
          {
            name: 'MECD - 1000 micrometres - 500 micrometres (Coarse sand)',
            data: 'MECD - 1000 micrometres - 500 micrometres (Coarse sand)_testing_data',
          },
          {
            name: 'MECD - 2000 micrometres - 1000 micrometres (Very coarse sand)',
            data: 'MECD - 2000 micrometres - 1000 micrometres (Very coarse sand)_testing_data',
          },
          {
            name: 'MECD - Obscuration',
            data: 'MECD - Obscuration_testing_data',
          },
          {
            name: 'MECD - 90% of particles less than',
            data: 'MECD - 90% of particles less than_testing_data',
          },
          {
            name: 'MECD - <62.5 micrometres (Silt and Clay)',
            data: 'MECD - <62.5 micrometres (Silt and Clay)_testing_data',
          },
        ],
      },
      {
        methodName: 'Metals - soluble',
        genericNames: [
          {
            name: 'Chromium as Cr - soluble ug/L',
            data: 'Chromium as Cr - soluble ug/L_testing_data',
          },
          {
            name: 'Chromium as Cr - soluble',
            data: 'Chromium as Cr - soluble_testing_data',
          },
          {
            name: 'Boron as B - soluble ug/L',
            data: 'Boron as B - soluble ug/L_testing_data',
          },
          {
            name: 'Boron as B - soluble',
            data: 'Boron as B - soluble_testing_data',
          },
          {
            name: 'Aluminium as Al - soluble ug/L',
            data: 'Aluminium as Al - soluble ug/L_testing_data',
          },
          {
            name: 'Aluminium as Al - soluble',
            data: 'Aluminium as Al - soluble_testing_data',
          },
        ],
      },
      {
        methodName: 'Metals - total',
        genericNames: [
          {
            name: 'Chromium as Cr - total ug/L',
            data: 'Chromium as Cr - total ug/L_testing_data',
          },
          {
            name: 'Chromium as Cr - total',
            data: 'Chromium as Cr - total_testing_data',
          },
          {
            name: 'Boron as B - total ug/L',
            data: 'Boron as B - total ug/L_testing_data',
          },
          {
            name: 'Aluminium as Al - total ug/L',
            data: 'Aluminium as Al - total ug/L_testing_data',
          },
          {
            name: 'Aluminium as Al - total',
            data: 'Aluminium as Al - total_testing_data',
          },
        ],
      },
      {
        methodName: 'Pesticides',
        genericNames: [
          {
            name: 'Chlorpyrifos-methyl',
            data: 'Chlorpyrifos-methyl_testing_data',
          },
          { name: 'Chlorpyrifos oxon', data: 'Chlorpyrifos oxon_testing_data' },
          { name: 'Chlorpyrifos', data: 'Chlorpyrifos_testing_data' },
          { name: 'Ametryn', data: 'Ametryn_testing_data' },
          { name: 'Amitraz', data: 'Amitraz_testing_data' },
          { name: 'Amicarbazone', data: 'Amicarbazone_testing_data' },
        ],
      },
      {
        methodName: 'Total Suspended Solids & Nutrients',
        genericNames: [
          {
            name: 'Dissolved inorganic nitrogen',
            data: 'Dissolved inorganic nitrogen_testing_data',
          },
          {
            name: 'Particulate phosphorus as P',
            data: 'Particulate phosphorus as P_testing_data',
          },
          {
            name: 'Dissolved organic phosphorus as P',
            data: 'Dissolved organic phosphorus as P_testing_data',
          },
          {
            name: 'Dissolved Kjeldahl phosphorus as P',
            data: 'Dissolved Kjeldahl phosphorus as P_testing_data',
          },
          {
            name: 'Total phosphorus as P',
            data: 'Total phosphorus as P_testing_data',
          },
          {
            name: 'Dissolved organic nitrogen as N',
            data: 'Dissolved organic nitrogen as N_testing_data',
          },
          {
            name: 'Total dissolved nitrogen as N',
            data: 'Total dissolved nitrogen as N_testing_data',
          },
          {
            name: 'Dissolved Kjeldahl nitrogen as N',
            data: 'Dissolved Kjeldahl nitrogen as N_testing_data',
          },
          {
            name: 'Ammonium nitrogen as N',
            data: 'Ammonium nitrogen as N_testing_data',
          },
          {
            name: 'Oxidised nitrogen as N',
            data: 'Oxidised nitrogen as N_testing_data',
          },
          {
            name: 'Total nitrogen as N',
            data: 'Total nitrogen as N_testing_data',
          },
          {
            name: 'Total Kjeldahl nitrogen as N',
            data: 'Total Kjeldahl nitrogen as N_testing_data',
          },
          {
            name: 'Particulate nitrogen as N',
            data: 'Particulate nitrogen as N_testing_data',
          },
          {
            name: 'Total suspended solids',
            data: 'Total suspended solids_testing_data',
          },
        ],
      },
    ],
  },
];

interface GenericNameItem {
  name: string;
  data: string;
}

interface MethodItem {
  methodName: string;
  genericNames: GenericNameItem[];
}

interface LaboratoryItem {
  laboratory: string;
  methods: MethodItem[];
}

export function AnalysisDownloadContent() {
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<{
    [key: string]: string[];
  }>({});
  const [selectedGenericNames, setSelectedGenericNames] = useState<{
    [key: string]: string[];
  }>({});
  const [expandedLabs, setExpandedLabs] = useState<string[]>([]);
  const [expandedMethods, setExpandedMethods] = useState<{
    [key: string]: string[];
  }>({});

  const handleLabSelection = (labName: string) => {
    setSelectedLabs(prev =>
      prev.includes(labName)
        ? prev.filter(lab => lab !== labName)
        : [...prev, labName],
    );

    // Toggle expansion
    setExpandedLabs(prev =>
      prev.includes(labName)
        ? prev.filter(lab => lab !== labName)
        : [...prev, labName],
    );
  };

  const handleMethodSelection = (labName: string, methodName: string) => {
    setSelectedMethods(prev => ({
      ...prev,
      [labName]: prev[labName]?.includes(methodName)
        ? prev[labName].filter(method => method !== methodName)
        : [...(prev[labName] || []), methodName],
    }));

    // Toggle method expansion
    setExpandedMethods(prev => ({
      ...prev,
      [labName]: prev[labName]?.includes(methodName)
        ? prev[labName].filter(method => method !== methodName)
        : [...(prev[labName] || []), methodName],
    }));
  };

  const handleGenericNameSelection = (
    methodKey: string,
    genericName: string,
  ) => {
    setSelectedGenericNames(prev => ({
      ...prev,
      [methodKey]: prev[methodKey]?.includes(genericName)
        ? prev[methodKey].filter(name => name !== genericName)
        : [...(prev[methodKey] || []), genericName],
    }));
  };

  const downloadCSV = () => {
    // Explicitly type the array as string[][]
    const csvData: string[][] = [];
    csvData.push([
      'Laboratory',
      'Lab analysis method short name',
      'generic_name',
      'data',
    ]);

    analysisData.forEach(lab => {
      if (selectedLabs.includes(lab.laboratory)) {
        lab.methods.forEach(method => {
          const methodKey = `${lab.laboratory}-${method.methodName}`;
          if (selectedMethods[lab.laboratory]?.includes(method.methodName)) {
            method.genericNames.forEach(generic => {
              if (selectedGenericNames[methodKey]?.includes(generic.name)) {
                csvData.push([
                  lab.laboratory,
                  method.methodName,
                  generic.name,
                  generic.data,
                ]);
              }
            });
          }
        });
      }
    });

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSelectedDataCount = () => {
    let count = 0;
    analysisData.forEach(lab => {
      if (selectedLabs.includes(lab.laboratory)) {
        lab.methods.forEach(method => {
          const methodKey = `${lab.laboratory}-${method.methodName}`;
          if (selectedMethods[lab.laboratory]?.includes(method.methodName)) {
            method.genericNames.forEach(generic => {
              if (selectedGenericNames[methodKey]?.includes(generic.name)) {
                count++;
              }
            });
          }
        });
      }
    });
    return count;
  };

  return (
    <ContentWrapper>
      <HeaderSection>
        <Title>Analysis Download</Title>
        <Description>
          Select laboratories, analysis methods, and specific parameters to
          download water quality data. Navigate through the hierarchical
          structure to build your custom dataset.
        </Description>
      </HeaderSection>

      <SelectionSection>
        <SectionTitle>Step 1: Select Laboratories</SectionTitle>
        <LaboratoryGrid>
          {analysisData.map(lab => (
            <LaboratoryCard
              key={lab.laboratory}
              selected={selectedLabs.includes(lab.laboratory)}
              expanded={expandedLabs.includes(lab.laboratory)}
            >
              <LabHeader
                onClick={() => handleLabSelection(lab.laboratory)}
                selected={selectedLabs.includes(lab.laboratory)}
              >
                <LabName>{lab.laboratory}</LabName>
                <ExpandIcon expanded={expandedLabs.includes(lab.laboratory)}>
                  {expandedLabs.includes(lab.laboratory) ? '▼' : '▶'}
                </ExpandIcon>
              </LabHeader>

              {expandedLabs.includes(lab.laboratory) &&
                selectedLabs.includes(lab.laboratory) && (
                  <MethodsSection>
                    <MethodTitle>Step 2: Select Analysis Methods</MethodTitle>
                    {lab.methods.map(method => (
                      <MethodItem key={method.methodName}>
                        <MethodHeader
                          onClick={() =>
                            handleMethodSelection(
                              lab.laboratory,
                              method.methodName,
                            )
                          }
                          selected={selectedMethods[lab.laboratory]?.includes(
                            method.methodName,
                          )}
                        >
                          <CheckboxInput
                            type="checkbox"
                            checked={
                              selectedMethods[lab.laboratory]?.includes(
                                method.methodName,
                              ) || false
                            }
                            onChange={() =>
                              handleMethodSelection(
                                lab.laboratory,
                                method.methodName,
                              )
                            }
                          />
                          <MethodName>{method.methodName}</MethodName>
                          <ExpandIcon
                            expanded={expandedMethods[lab.laboratory]?.includes(
                              method.methodName,
                            )}
                          >
                            {expandedMethods[lab.laboratory]?.includes(
                              method.methodName,
                            )
                              ? '▼'
                              : '▶'}
                          </ExpandIcon>
                        </MethodHeader>

                        {expandedMethods[lab.laboratory]?.includes(
                          method.methodName,
                        ) && (
                          <GenericNamesSection>
                            <GenericTitle>
                              Step 3: Select Parameters
                            </GenericTitle>
                            <GenericNamesGrid>
                              {method.genericNames.map(generic => {
                                const methodKey = `${lab.laboratory}-${method.methodName}`;
                                return (
                                  <GenericNameItem key={generic.name}>
                                    <CheckboxInput
                                      type="checkbox"
                                      checked={
                                        selectedGenericNames[
                                          methodKey
                                        ]?.includes(generic.name) || false
                                      }
                                      onChange={() =>
                                        handleGenericNameSelection(
                                          methodKey,
                                          generic.name,
                                        )
                                      }
                                    />
                                    <GenericLabel>{generic.name}</GenericLabel>
                                  </GenericNameItem>
                                );
                              })}
                            </GenericNamesGrid>
                          </GenericNamesSection>
                        )}
                      </MethodItem>
                    ))}
                  </MethodsSection>
                )}
            </LaboratoryCard>
          ))}
        </LaboratoryGrid>
      </SelectionSection>

      <DownloadSection>
        <DownloadSummary>
          <SummaryText>
            Selected Data Points: <strong>{getSelectedDataCount()}</strong>
          </SummaryText>
          <DownloadButton
            onClick={downloadCSV}
            disabled={getSelectedDataCount() === 0}
          >
            Download CSV
          </DownloadButton>
        </DownloadSummary>
      </DownloadSection>
    </ContentWrapper>
  );
}

// Styled Components
const ContentWrapper = styled.div`
  min-height: calc(100vh - 120px);
  background: #ffffff;
  padding: 32px 64px;
  font-family: 'Lato', sans-serif;
`;

const HeaderSection = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  color: #03213f;
  margin-bottom: 16px;
`;

const Description = styled.p`
  font-size: 16px;
  color: #414141;
  line-height: 1.5;
  max-width: 800px;
`;

const SelectionSection = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #05325f;
  margin-bottom: 24px;
`;

const LaboratoryGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const LaboratoryCard = styled.div<{ selected: boolean; expanded: boolean }>`
  border: 2px solid ${props => (props.selected ? '#6bbe27' : '#e0e0e0')};
  border-radius: 8px;
  background: ${props => (props.selected ? '#f8fdf5' : '#ffffff')};
  transition: all 0.3s ease;

  &:hover {
    border-color: #6bbe27;
  }
`;

const LabHeader = styled.div<{ selected: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  background: ${props => (props.selected ? '#6bbe27' : '#f5f5f5')};
  color: ${props => (props.selected ? '#ffffff' : '#161616')};
  border-radius: 6px 6px 0 0;

  &:hover {
    background: ${props => (props.selected ? '#5ba322' : '#e8e8e8')};
  }
`;

const LabName = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
`;

const ExpandIcon = styled.span<{ expanded: boolean }>`
  font-size: 14px;
  transition: transform 0.3s ease;
  transform: ${props => (props.expanded ? 'rotate(0deg)' : 'rotate(-90deg)')};
`;

const MethodsSection = styled.div`
  padding: 20px;
`;

const MethodTitle = styled.h4`
  font-size: 18px;
  font-weight: bold;
  color: #05325f;
  margin-bottom: 16px;
`;

const MethodItem = styled.div`
  margin-bottom: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
`;

const MethodHeader = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  background: ${props => (props.selected ? '#e8f5e8' : '#ffffff')};

  &:hover {
    background: #f0f8f0;
  }
`;

const CheckboxInput = styled.input`
  margin-right: 12px;
  transform: scale(1.2);
`;

const MethodName = styled.span`
  font-size: 16px;
  color: #161616;
  flex: 1;
`;

const GenericNamesSection = styled.div`
  padding: 16px;
  background: #fafafa;
  border-top: 1px solid #e0e0e0;
`;

const GenericTitle = styled.h5`
  font-size: 16px;
  font-weight: bold;
  color: #05325f;
  margin-bottom: 12px;
`;

const GenericNamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 8px;
`;

const GenericNameItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  background: #ffffff;
  border-radius: 4px;
  border: 1px solid #e0e0e0;

  &:hover {
    background: #f8f8f8;
  }
`;

const GenericLabel = styled.span`
  font-size: 14px;
  color: #414141;
`;

const DownloadSection = styled.div`
  border-top: 2px solid #e0e0e0;
  padding-top: 24px;
`;

const DownloadSummary = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
`;

const SummaryText = styled.div`
  font-size: 16px;
  color: #414141;
`;

const DownloadButton = styled.button`
  background: #6bbe27;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover:not(:disabled) {
    background: #5ba322;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;
