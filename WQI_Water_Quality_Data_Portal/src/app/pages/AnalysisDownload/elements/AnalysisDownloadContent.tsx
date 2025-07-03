import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import JSZip from 'jszip';

interface CSVRow {
  laboratory: string;
  lab_analysis_method_short_name: string;
  start_date: string;
  end_date: string;
  com_lab_analysis_method: string;
  primary_analyte_group: string;
  generic_name: string;
  unit: string;
  lor: string;
  lor_unit: string;
  analysis_location: string;
}

interface ParameterItem {
  genericName: string;
  unit: string;
}

interface MethodItem {
  methodName: string;
  parameters: ParameterItem[];
}

interface AnalyteGroupItem {
  groupName: string;
  methods: MethodItem[];
}

interface LaboratoryItem {
  laboratory: string;
  analyteGroups: AnalyteGroupItem[];
}

interface AnalysisLocationItem {
  analysisLocation: string;
  laboratories: LaboratoryItem[];
}

interface ValidationResult {
  isValid: boolean;
  removedSelections: string[];
  completeSelections: string[];
}

export default function AnalysisDownloadContent() {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');

  // 4-layer selection states
  const [selectedAnalysisLocations, setSelectedAnalysisLocations] = useState<
    string[]
  >([]);
  const [selectedLaboratories, setSelectedLaboratories] = useState<{
    [key: string]: string[];
  }>({});
  const [selectedAnalyteGroups, setSelectedAnalyteGroups] = useState<{
    [key: string]: string[];
  }>({});
  const [selectedMethods, setSelectedMethods] = useState<{
    [key: string]: string[];
  }>({});

  // Expansion states
  const [expandedAnalysisLocations, setExpandedAnalysisLocations] = useState<
    string[]
  >([]);
  const [expandedLaboratories, setExpandedLaboratories] = useState<{
    [key: string]: string[];
  }>({});
  const [expandedAnalyteGroups, setExpandedAnalyteGroups] = useState<{
    [key: string]: string[];
  }>({});
  const [expandedMethods, setExpandedMethods] = useState<{
    [key: string]: string[];
  }>({});

  // Fetch and parse CSV data from local public folder
  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        setLoading(true);

        console.log('🔍 DEBUGGING CSV LOAD:');
        console.log('Current page URL:', window.location.href);
        console.log(
          'Expected CSV file path:',
          window.location.origin + '/water-data-portal/lab_reference_info.csv',
        );
        console.log(
          'Attempting to fetch from: /water-data-portal/lab_reference_info.csv',
        );

        console.log('🌐 Testing development server...');
        const startTime = performance.now();

        const response = await fetch(
          'http://localhost:3001/api/lab-reference-csv?t=' + Date.now(),
        );
        const endTime = performance.now();

        console.log(
          `⏱️ Fetch completed in ${(endTime - startTime).toFixed(2)}ms`,
        );
        console.log('📊 Response details:');
        console.log('  - Status:', response.status);
        console.log('  - Status Text:', response.statusText);
        console.log('  - URL:', response.url);
        console.log(
          '  - Headers:',
          Object.fromEntries(response.headers.entries()),
        );

        if (!response.ok) {
          console.error('❌ HTTP Error Details:');
          console.error('  - Status:', response.status);
          console.error('  - Status Text:', response.statusText);

          if (response.status === 404) {
            console.error('🚫 FILE NOT FOUND - Possible solutions:');
            console.error(
              '  1. Check file exists at: public/water-data-portal/lab_reference_info.csv',
            );
            console.error('  2. Restart your development server');
            console.error('  3. Clear browser cache (Ctrl+F5)');
          }

          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const csvText = await response.text();
        console.log('📄 File content analysis:');
        console.log('  - Total length:', csvText.length, 'characters');
        console.log('  - First line:', csvText.split('\n')[0]);

        // Check for UTF-8 BOM (Byte Order Mark)
        const hasBOM = csvText.charCodeAt(0) === 0xfeff;
        console.log('  - Has UTF-8 BOM:', hasBOM);

        // Check for common encoding issues
        const hasSpecialChars = /[^\u0000-\u007F]/.test(csvText);
        console.log('  - Contains non-ASCII characters:', hasSpecialChars);

        // Clean BOM if present
        const cleanCsvText = hasBOM ? csvText.substring(1) : csvText;

        console.log('  - First 200 characters:');
        console.log('   ', JSON.stringify(cleanCsvText.substring(0, 200)));

        const lines = cleanCsvText.split('\n');
        console.log('📋 CSV structure:');
        console.log('  - Total lines:', lines.length);
        console.log(
          '  - Empty lines:',
          lines.filter(line => !line.trim()).length,
        );

        if (lines.length === 0) {
          throw new Error('CSV file is empty');
        }

        const headers = lines[0]
          .split(',')
          .map(header => header.trim().replace(/^"|"$/g, ''));
        console.log('  - Headers:', headers);
        console.log('  - Header count:', headers.length);

        // Updated expected headers for new CSV structure
        const expectedHeaders = [
          'laboratory',
          'lab_analysis_method_short_name',
          'start_date',
          'end_date',
          'com_lab_analysis_method',
          'primary_analyte_group',
          'generic_name',
          'unit',
          'lor',
          'lor_unit',
          'analysis_location',
        ];
        const headersMatch = expectedHeaders.every(expected =>
          headers.includes(expected),
        );
        console.log('  - Headers match expected:', headersMatch);

        if (!headersMatch) {
          console.warn('⚠️ Header mismatch. Expected:', expectedHeaders);
          console.warn('⚠️ Found:', headers);
        }

        const data: CSVRow[] = [];
        let successfulRows = 0;
        let skippedRows = 0;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line) {
            // Simple CSV parsing - split by comma but handle quoted values
            const values: string[] = [];
            let current = '';
            let inQuotes = false;

            for (let j = 0; j < line.length; j++) {
              const char = line[j];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim()); // Add the last value

            if (values.length >= 11) {
              // Updated minimum required columns for new structure
              const row: CSVRow = {
                laboratory: values[0] || '',
                lab_analysis_method_short_name: values[1] || '',
                start_date: values[2] || '',
                end_date: values[3] || '',
                com_lab_analysis_method: values[4] || '',
                primary_analyte_group: values[5] || '',
                generic_name: values[6] || '',
                unit: values[7] || '',
                lor: values[8] || '',
                lor_unit: values[9] || '',
                analysis_location: values[10] || '',
              };

              // Only add rows with valid required data for new structure
              if (
                row.laboratory &&
                row.lab_analysis_method_short_name &&
                row.primary_analyte_group &&
                row.generic_name &&
                row.analysis_location
              ) {
                data.push(row);
                successfulRows++;
              } else {
                skippedRows++;
                console.warn(
                  `⚠️ Skipped row ${i} (missing required data):`,
                  row,
                );
              }
            } else {
              skippedRows++;
              console.warn(
                `⚠️ Skipped row ${i} (insufficient columns):`,
                values,
              );
            }
          }
        }

        console.log('✅ Parsing completed:');
        console.log('  - Successful rows:', successfulRows);
        console.log('  - Skipped rows:', skippedRows);
        console.log('  - Sample first 3 rows:');
        data.slice(0, 3).forEach((row, index) => {
          console.log(`    Row ${index + 1}:`, {
            analysis_location: row.analysis_location,
            laboratory: row.laboratory,
            primary_analyte_group: row.primary_analyte_group,
            method: row.lab_analysis_method_short_name,
            generic_name: row.generic_name,
          });
        });

        // Check for unique analysis locations (new hierarchy level)
        const uniqueLocations = Array.from(
          new Set(data.map(row => row.analysis_location)),
        );
        console.log('📍 Unique analysis locations found:', uniqueLocations);

        // Check for unique laboratories
        const uniqueLabs = Array.from(new Set(data.map(row => row.laboratory)));
        console.log('🏢 Unique laboratories found:', uniqueLabs);

        setCsvData(data);
        setError(null);
        console.log('✅ CSV data successfully loaded and state updated!');
      } catch (err) {
        console.error('❌ CSV Loading Failed:');

        const error = err as Error;
        console.error('  - Error type:', error.constructor?.name || 'Unknown');
        console.error('  - Error message:', error.message || 'Unknown error');
        console.error('  - Full error:', err);

        let errorMessage = `Failed to load CSV data: ${
          error.message || 'Unknown error'
        }\n\n`;
        errorMessage += '🔧 Troubleshooting steps:\n';
        errorMessage +=
          '1. Verify file exists at: public/water-data-portal/lab_reference_info.csv\n';
        errorMessage += '2. Restart your development server\n';
        errorMessage += '3. Check browser console for detailed logs\n';
        errorMessage += '4. Ensure file is saved as UTF-8 encoding\n';
        errorMessage +=
          '5. Verify new CSV structure with analysis_location column';

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCSVData();
  }, []);

  // Filter data based on end date selection
  const filteredCsvData = useMemo(() => {
    if (!selectedEndDate) return csvData;

    const selectedDate = new Date(selectedEndDate);
    const fiveYearsAgo = new Date(selectedDate);
    fiveYearsAgo.setFullYear(selectedDate.getFullYear() - 5);

    return csvData.filter(row => {
      if (!row.end_date) {
        // Use current date as default for null end_date
        const currentDate = new Date();
        return currentDate >= fiveYearsAgo;
      }

      const endDate = new Date(row.end_date);
      return endDate >= fiveYearsAgo;
    });
  }, [csvData, selectedEndDate]);

  // Build 4-layer hierarchical structure
  const analysisData = useMemo((): AnalysisLocationItem[] => {
    if (!filteredCsvData.length) return [];

    const locationMap = new Map<
      string,
      Map<string, Map<string, Map<string, Set<string>>>>
    >();

    // Group data by analysis_location -> laboratory -> primary_analyte_group -> method -> parameters
    filteredCsvData.forEach(row => {
      if (
        !row.analysis_location ||
        !row.laboratory ||
        !row.primary_analyte_group ||
        !row.lab_analysis_method_short_name
      )
        return;

      if (!locationMap.has(row.analysis_location)) {
        locationMap.set(row.analysis_location, new Map());
      }

      const labMap = locationMap.get(row.analysis_location)!;
      if (!labMap.has(row.laboratory)) {
        labMap.set(row.laboratory, new Map());
      }

      const groupMap = labMap.get(row.laboratory)!;
      if (!groupMap.has(row.primary_analyte_group)) {
        groupMap.set(row.primary_analyte_group, new Map());
      }

      const methodMap = groupMap.get(row.primary_analyte_group)!;
      if (!methodMap.has(row.lab_analysis_method_short_name)) {
        methodMap.set(row.lab_analysis_method_short_name, new Set());
      }

      // Use composite key for deduplication: genericName|unit
      const compositeKey = `${row.generic_name}|${row.unit}`;
      methodMap.get(row.lab_analysis_method_short_name)!.add(compositeKey);
    });

    // Convert to array structure
    const result: AnalysisLocationItem[] = [];
    locationMap.forEach((labMap, analysisLocation) => {
      const laboratories: LaboratoryItem[] = [];

      labMap.forEach((groupMap, laboratory) => {
        const analyteGroups: AnalyteGroupItem[] = [];

        groupMap.forEach((methodMap, groupName) => {
          const methods: MethodItem[] = [];

          methodMap.forEach((parameterSet, methodName) => {
            const parameters: ParameterItem[] = Array.from(parameterSet).map(
              compositeKey => {
                const [genericName, unit] = compositeKey.split('|');
                return { genericName, unit };
              },
            );
            methods.push({ methodName, parameters });
          });

          analyteGroups.push({ groupName, methods });
        });

        laboratories.push({ laboratory, analyteGroups });
      });

      result.push({ analysisLocation, laboratories });
    });

    return result;
  }, [filteredCsvData]);

  // Selection handlers
  const handleAnalysisLocationSelection = (location: string) => {
    setSelectedAnalysisLocations(prev =>
      prev.includes(location)
        ? prev.filter(loc => loc !== location)
        : [...prev, location],
    );

    setExpandedAnalysisLocations(prev =>
      prev.includes(location)
        ? prev.filter(loc => loc !== location)
        : [...prev, location],
    );
  };

  const handleLaboratorySelection = (location: string, laboratory: string) => {
    setSelectedLaboratories(prev => ({
      ...prev,
      [location]: prev[location]?.includes(laboratory)
        ? prev[location].filter(lab => lab !== laboratory)
        : [...(prev[location] || []), laboratory],
    }));

    setExpandedLaboratories(prev => ({
      ...prev,
      [location]: prev[location]?.includes(laboratory)
        ? prev[location].filter(lab => lab !== laboratory)
        : [...(prev[location] || []), laboratory],
    }));
  };

  const handleAnalyteGroupSelection = (
    locationLabKey: string,
    groupName: string,
  ) => {
    setSelectedAnalyteGroups(prev => ({
      ...prev,
      [locationLabKey]: prev[locationLabKey]?.includes(groupName)
        ? prev[locationLabKey].filter(group => group !== groupName)
        : [...(prev[locationLabKey] || []), groupName],
    }));

    setExpandedAnalyteGroups(prev => ({
      ...prev,
      [locationLabKey]: prev[locationLabKey]?.includes(groupName)
        ? prev[locationLabKey].filter(group => group !== groupName)
        : [...(prev[locationLabKey] || []), groupName],
    }));
  };

  const handleMethodSelection = (groupKey: string, methodName: string) => {
    setSelectedMethods(prev => ({
      ...prev,
      [groupKey]: prev[groupKey]?.includes(methodName)
        ? prev[groupKey].filter(method => method !== methodName)
        : [...(prev[groupKey] || []), methodName],
    }));

    setExpandedMethods(prev => ({
      ...prev,
      [groupKey]: prev[groupKey]?.includes(methodName)
        ? prev[groupKey].filter(method => method !== methodName)
        : [...(prev[groupKey] || []), methodName],
    }));
  };

  // Download sample data CSV
  const downloadSampleData = async () => {
    try {
      console.log('🔽 Starting sample data download...');

      const response = await fetch(
        'http://localhost:3001/api/sample-data-csv?t=' + Date.now(),
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const csvContent = await response.text();

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'sample_data.csv';
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      console.log('✅ Sample data downloaded successfully');
      alert('Sample data CSV downloaded successfully!');
    } catch (error) {
      console.error('❌ Sample data download failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to download sample data: ${errorMessage}`);
    }
  };

  // COMMENTED OUT - Download monitoring sites CSV
  // const downloadMonitoringSites = async () => {
  //   try {
  //     console.log('🔽 Starting monitoring sites download...');

  //     const response = await fetch(
  //       'http://localhost:3001/api/monitoring-sites-csv?t=' + Date.now(),
  //     );

  //     if (!response.ok) {
  //       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  //     }

  //     const csvContent = await response.text();

  //     // Create and download the file
  //     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  //     const url = URL.createObjectURL(blob);

  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = 'monitoring_sites.csv';
  //     link.style.display = 'none';

  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);

  //     URL.revokeObjectURL(url);

  //     console.log('✅ Monitoring sites downloaded successfully');
  //     alert('Monitoring sites CSV downloaded successfully!');
  //   } catch (error) {
  //     console.error('❌ Monitoring sites download failed:', error);
  //     const errorMessage =
  //       error instanceof Error ? error.message : 'Unknown error occurred';
  //     alert(`Failed to download monitoring sites: ${errorMessage}`);
  //   }
  // };

  // NEW: Download inhouse laboratory template Excel
  const downloadInhouseLaboratoryTemplate = async () => {
    try {
      console.log('🔽 Starting inhouse laboratory template download...');

      const response = await fetch(
        'http://localhost:3001/api/inhouse-laboratory-template-xlsx?t=' +
          Date.now(),
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const excelContent = await response.arrayBuffer();

      // Create and download the file
      const blob = new Blob([excelContent], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'inhouse_laboratory_template.xlsx';
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      console.log('✅ Inhouse laboratory template downloaded successfully');
      alert('Inhouse laboratory template Excel downloaded successfully!');
    } catch (error) {
      console.error('❌ Inhouse laboratory template download failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to download inhouse laboratory template: ${errorMessage}`);
    }
  };

  // Download site template Excel
  const downloadSiteTemplate = async () => {
    try {
      console.log('🔽 Starting site template download...');

      const response = await fetch(
        'http://localhost:3001/api/site-template-xlsx?t=' + Date.now(),
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const excelContent = await response.arrayBuffer();

      // Create and download the file
      const blob = new Blob([excelContent], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'site_template.xlsx';
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      console.log('✅ Site template downloaded successfully');
      alert('Site template Excel downloaded successfully!');
    } catch (error) {
      console.error('❌ Site template download failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to download site template: ${errorMessage}`);
    }
  };

  // Download project template Excel
  const downloadProjectTemplate = async () => {
    try {
      console.log('🔽 Starting project template download...');

      const response = await fetch(
        'http://localhost:3001/api/project-template-xlsx?t=' + Date.now(),
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const excelContent = await response.arrayBuffer();

      // Create and download the file
      const blob = new Blob([excelContent], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'project_template.xlsx';
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      console.log('✅ Project template downloaded successfully');
      alert('Project template Excel downloaded successfully!');
    } catch (error) {
      console.error('❌ Project template download failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to download project template: ${errorMessage}`);
    }
  };

  // Download metadata statement template Excel
  const downloadMetadataStatementTemplate = async () => {
    try {
      console.log('🔽 Starting metadata statement template download...');

      const response = await fetch(
        'http://localhost:3001/api/metadata-statement-template-xlsx?t=' +
          Date.now(),
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const excelContent = await response.arrayBuffer();

      // Create and download the file
      const blob = new Blob([excelContent], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'metadata_statement_template.xlsx';
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      console.log('✅ Metadata statement template downloaded successfully');
      alert('Metadata statement template Excel downloaded successfully!');
    } catch (error) {
      console.error('❌ Metadata statement template download failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to download metadata statement template: ${errorMessage}`);
    }
  };

  // UPDATED: Main download function - now always creates ZIP with README
  const downloadAnalysisData = async () => {
    // Helper function to validate and clean incomplete selections
    const validateAndCleanSelections = (
      selectedAnalysisLocations: string[],
      selectedLaboratories: { [key: string]: string[] },
      selectedAnalyteGroups: { [key: string]: string[] },
      selectedMethods: { [key: string]: string[] },
      analysisData: AnalysisLocationItem[],
    ): ValidationResult => {
      const removedSelections: string[] = [];
      const completeSelections: string[] = [];

      // Clean up incomplete selections using bottom-up cascade
      selectedAnalysisLocations.filter(location => {
        const locationData = analysisData.find(
          item => item.analysisLocation === location,
        );
        if (!locationData) {
          removedSelections.push(
            `Analysis Location: ${location} (not found in data)`,
          );
          return false;
        }

        let hasValidLaboratory = false;

        // Check laboratories for this location
        const selectedLabs = selectedLaboratories[location] || [];
        selectedLabs.filter(laboratory => {
          const labData = locationData.laboratories.find(
            lab => lab.laboratory === laboratory,
          );
          if (!labData) {
            removedSelections.push(
              `Laboratory: ${laboratory} in ${location} (not found)`,
            );
            return false;
          }

          let hasValidGroup = false;

          // Check analyte groups for this lab
          const locationLabKey = `${location}-${laboratory}`;
          const selectedGroups = selectedAnalyteGroups[locationLabKey] || [];
          selectedGroups.filter(groupName => {
            const groupData = labData.analyteGroups.find(
              group => group.groupName === groupName,
            );
            if (!groupData) {
              removedSelections.push(
                `Analyte Group: ${groupName} in ${laboratory} (not found)`,
              );
              return false;
            }

            let hasValidMethod = false;

            // Check methods for this group
            const groupKey = `${locationLabKey}-${groupName}`;
            const selectedMethodsList = selectedMethods[groupKey] || [];
            const validMethods = selectedMethodsList.filter(methodName => {
              const methodData = groupData.methods.find(
                method => method.methodName === methodName,
              );
              if (!methodData) {
                removedSelections.push(
                  `Method: ${methodName} in ${groupName} (not found)`,
                );
                return false;
              }
              return true;
            });

            if (validMethods.length > 0) {
              hasValidMethod = true;
              validMethods.forEach(method => {
                completeSelections.push(
                  `${location} → ${laboratory} → ${groupName} → ${method}`,
                );
              });
            } else {
              removedSelections.push(
                `Analyte Group: ${groupName} (no valid methods)`,
              );
            }

            return hasValidMethod;
          });

          if (selectedGroups.length > 0) {
            hasValidGroup = true;
          } else {
            removedSelections.push(
              `Laboratory: ${laboratory} (no valid analyte groups)`,
            );
          }

          return hasValidGroup;
        });

        if (selectedLabs.length > 0) {
          hasValidLaboratory = true;
        } else {
          removedSelections.push(
            `Analysis Location: ${location} (no valid laboratories)`,
          );
        }

        return hasValidLaboratory;
      });

      return {
        isValid: completeSelections.length > 0,
        removedSelections,
        completeSelections,
      };
    };

    // Helper function to collect selected parameters per laboratory
    const collectParametersByLaboratory = (
      selectedAnalysisLocations: string[],
      selectedLaboratories: { [key: string]: string[] },
      selectedAnalyteGroups: { [key: string]: string[] },
      selectedMethods: { [key: string]: string[] },
      analysisData: AnalysisLocationItem[],
    ): Map<
      string,
      Array<{
        genericName: string;
        unit: string;
        methodName: string;
        analysisLocation: string;
      }>
    > => {
      const laboratoryParameters = new Map<
        string,
        Array<{
          genericName: string;
          unit: string;
          methodName: string;
          analysisLocation: string;
        }>
      >();

      selectedAnalysisLocations.forEach(location => {
        const locationData = analysisData.find(
          item => item.analysisLocation === location,
        );
        if (!locationData) return;

        const selectedLabs = selectedLaboratories[location] || [];

        selectedLabs.forEach(laboratory => {
          const labData = locationData.laboratories.find(
            lab => lab.laboratory === laboratory,
          );
          if (!labData) return;

          const locationLabKey = `${location}-${laboratory}`;
          const selectedGroups = selectedAnalyteGroups[locationLabKey] || [];

          selectedGroups.forEach(groupName => {
            const groupData = labData.analyteGroups.find(
              group => group.groupName === groupName,
            );
            if (!groupData) return;

            const groupKey = `${locationLabKey}-${groupName}`;
            const selectedMethodsList = selectedMethods[groupKey] || [];

            selectedMethodsList.forEach(methodName => {
              const methodData = groupData.methods.find(
                method => method.methodName === methodName,
              );
              if (!methodData) return;

              // Initialize laboratory array if not exists
              if (!laboratoryParameters.has(laboratory)) {
                laboratoryParameters.set(laboratory, []);
              }

              const labParams = laboratoryParameters.get(laboratory)!;

              // Add all parameters from this method
              methodData.parameters.forEach(param => {
                labParams.push({
                  genericName: param.genericName,
                  unit: param.unit,
                  methodName: methodName,
                  analysisLocation: location,
                });
              });
            });
          });
        });
      });

      return laboratoryParameters;
    };

    // Helper function to apply end date filtering per parameter
    const applyEndDateFiltering = (
      parameters: Array<{
        genericName: string;
        unit: string;
        methodName: string;
        analysisLocation: string;
      }>,
      selectedEndDate: string,
      csvData: CSVRow[],
    ): Array<{
      genericName: string;
      unit: string;
      methodName: string;
      analysisLocation: string;
    }> => {
      if (!selectedEndDate) return parameters;

      const selectedDate = new Date(selectedEndDate);
      const fiveYearsAgo = new Date(selectedDate);
      fiveYearsAgo.setFullYear(selectedDate.getFullYear() - 5);

      return parameters.filter(param => {
        // Find matching CSV rows for this parameter
        const matchingRows = csvData.filter(
          row =>
            row.generic_name === param.genericName && row.unit === param.unit,
        );

        // If no matching rows found, include the parameter
        if (matchingRows.length === 0) return true;

        // Check if any matching row passes the date filter
        return matchingRows.some(row => {
          if (!row.end_date) {
            // Use current date as default for null end_date
            const currentDate = new Date();
            return currentDate >= fiveYearsAgo;
          }

          const endDate = new Date(row.end_date);
          return endDate >= fiveYearsAgo;
        });
      });
    };

    // Helper function to remove duplicates based on composite key (genericName + unit)
    const deduplicateParameters = (
      parameters: Array<{
        genericName: string;
        unit: string;
        methodName: string;
        analysisLocation: string;
      }>,
    ): Array<{
      genericName: string;
      unit: string;
      methodName: string;
      analysisLocation: string;
    }> => {
      const seen = new Set<string>();
      const deduplicated: Array<{
        genericName: string;
        unit: string;
        methodName: string;
        analysisLocation: string;
      }> = [];

      parameters.forEach(param => {
        const compositeKey = `${param.genericName}|${param.unit}`;
        if (!seen.has(compositeKey)) {
          seen.add(compositeKey);
          deduplicated.push(param);
        }
      });

      return deduplicated;
    };

    // Helper function to generate CSV content (3 rows)
    const generateCSVContent = (
      laboratoryName: string,
      parameters: Array<{
        genericName: string;
        unit: string;
        methodName: string;
        analysisLocation: string;
      }>,
    ): string => {
      const staticColumnsCount = 7;
      const staticRow1 = [
        `"${laboratoryName}"`,
        ...Array(staticColumnsCount - 1).fill(''),
      ];
      const staticRow2 = [
        'Project Code',
        'Site Code',
        'Sampling Date Time',
        'Sample Unique Identifier',
        'Sample Collection Method',
        'Depth (m)',
        'Comment',
      ];
      const staticRow3 = Array(staticColumnsCount).fill('');
      const dynamicRow1 = parameters.map(param => `"${param.methodName}"`);
      const dynamicRow2 = parameters.map(param => `"${param.genericName}"`);
      const dynamicRow3 = parameters.map(param => `"${param.unit}"`);

      const row1 = [...staticRow1, ...dynamicRow1].join(',');
      const row2 = [...staticRow2, ...dynamicRow2].join(',');
      const row3 = [...staticRow3, ...dynamicRow3].join(',');

      return `${row1}\n${row2}\n${row3}`;
    };

    // NEW: Function to fetch README file from mock server (alternative approach)
    const fetchReadmeFile = async (): Promise<string> => {
      try {
        console.log('📄 Fetching download_readme.md file...');

        // Try the backend API first
        try {
          const response = await fetch(
            'http://localhost:3001/api/download-readme-md?t=' + Date.now(),
          );

          if (response.ok) {
            const readmeContent = await response.text();
            console.log('✅ README file fetched successfully from backend API');
            return readmeContent;
          }
        } catch (apiError) {
          console.log('⚠️ Backend API failed, trying mock server...');
        }

        // Fallback: try fetching directly from mock server
        try {
          const response = await fetch(
            'http://localhost:8080/wqinv_templates/download_readme.md?t=' +
              Date.now(),
          );

          if (response.ok) {
            const readmeContent = await response.text();
            console.log('✅ README file fetched successfully from mock server');
            return readmeContent;
          }
        } catch (mockError) {
          console.log('⚠️ Mock server also failed, using fallback content...');
        }

        throw new Error('Both backend API and mock server failed');
      } catch (error) {
        console.error('⚠️ Failed to fetch README file:', error);
        // Return a default README content if fetch fails
        return `# Water Quality Data Download

## Overview
This package contains water quality analysis data downloaded from the Water Data Portal.

## File Structure
- **CSV files**: Laboratory-specific water quality parameter data
- **README.md**: This documentation file

## Data Format
Each CSV file contains:
- Row 1: Laboratory name and method names
- Row 2: Static headers and parameter generic names  
- Row 3: Units for each parameter

## Contact
For questions about this data, please contact the Water Data Portal administrators.

Generated on: ${new Date().toISOString()}
`;
      }
    };

    // NEW: Updated function to create ZIP with README - always creates ZIP
    const downloadZipWithReadme = async (
      files: Array<{ filename: string; content: string }>,
    ): Promise<void> => {
      try {
        console.log('📦 Creating ZIP package with README...');

        // Fetch the README file
        const readmeContent = await fetchReadmeFile();

        const zip = new JSZip();

        // Add README file first
        zip.file('download_readme.md', readmeContent);

        // Add all CSV files to the ZIP
        files.forEach(file => {
          zip.file(file.filename, file.content);
        });

        // Generate ZIP blob
        const zipBlob = await zip.generateAsync({ type: 'blob' });

        // Download the ZIP file
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'water_quality_data.zip';
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        console.log('✅ ZIP package downloaded successfully');
      } catch (error) {
        console.error('❌ Error creating ZIP file:', error);
        throw new Error(
          'Failed to create ZIP file with README. Please try again.',
        );
      }
    };

    try {
      console.log('🚀 Starting download process...');

      // Step 1: Validate and clean incomplete selections
      console.log('📋 Step 1: Validating selections...');
      const validation = validateAndCleanSelections(
        selectedAnalysisLocations,
        selectedLaboratories,
        selectedAnalyteGroups,
        selectedMethods,
        analysisData,
      );

      // Show feedback for removed selections
      if (validation.removedSelections.length > 0) {
        const removedMessage = `The following incomplete selections were automatically removed:\n\n${validation.removedSelections.join(
          '\n',
        )}`;
        console.warn(
          '⚠️ Removed incomplete selections:',
          validation.removedSelections,
        );
        alert(removedMessage);
      }

      if (!validation.isValid) {
        alert(
          'No complete selection paths found. Please ensure you have selected all 4 layers:\nAnalysis Location → Laboratory → Analyte Group → Method',
        );
        return;
      }

      console.log(
        '✅ Valid complete selections:',
        validation.completeSelections,
      );

      // Step 2: Collect selected parameters per laboratory
      console.log('📊 Step 2: Collecting parameters by laboratory...');
      const laboratoryParameters = collectParametersByLaboratory(
        selectedAnalysisLocations,
        selectedLaboratories,
        selectedAnalyteGroups,
        selectedMethods,
        analysisData,
      );

      console.log(
        '🏢 Found parameters for laboratories:',
        Array.from(laboratoryParameters.keys()),
      );

      // Step 3: Process each laboratory
      const filesToDownload: Array<{ filename: string; content: string }> = [];

      // Convert Map entries to array to avoid iteration issues
      const labEntries = Array.from(laboratoryParameters.entries());

      for (const [laboratory, parameters] of labEntries) {
        console.log(
          `🔬 Processing laboratory: ${laboratory} (${parameters.length} raw parameters)`,
        );

        // Step 3a: Apply end date filtering per parameter
        const dateFilteredParameters = applyEndDateFiltering(
          parameters,
          selectedEndDate,
          csvData,
        );
        console.log(
          `📅 After date filtering: ${dateFilteredParameters.length} parameters`,
        );

        // Step 3b: Remove composite key duplicates
        const deduplicatedParameters = deduplicateParameters(
          dateFilteredParameters,
        );
        console.log(
          `🔄 After deduplication: ${deduplicatedParameters.length} unique parameters`,
        );

        if (deduplicatedParameters.length > 0) {
          // Step 3c: Generate CSV content (3 rows)
          const csvContent = generateCSVContent(
            laboratory,
            deduplicatedParameters,
          );

          // Step 3d: Create filename (laboratory name + .csv)
          const filename = `${laboratory}.csv`;

          filesToDownload.push({
            filename,
            content: csvContent,
          });

          console.log(
            `📄 Generated file: ${filename} (${deduplicatedParameters.length} parameters)`,
          );
        } else {
          console.warn(
            `⚠️ No parameters remaining for laboratory: ${laboratory} after filtering`,
          );
        }
      }

      if (filesToDownload.length === 0) {
        alert(
          'No data remaining after applying filters and validation. Please check your selections and date filters.',
        );
        return;
      }

      // Step 4: Always download as ZIP with README
      console.log(
        `📥 Step 4: Creating ZIP package with ${filesToDownload.length} CSV files + README...`,
      );

      await downloadZipWithReadme(filesToDownload);

      // Step 5: Success feedback
      const successMessage = `Successfully generated ZIP package containing:\n\n• download_readme.md (documentation)\n${filesToDownload
        .map(f => `• ${f.filename}`)
        .join('\n')}\n\nTotal CSV files: ${
        filesToDownload.length
      }\nTotal unique parameters: ${filesToDownload.reduce(
        (sum, file) => sum + file.content.split('\n')[1].split(',').length - 7,
        0,
      )}`;

      console.log('✅ Download process completed successfully');
      alert(successMessage);
    } catch (error) {
      console.error('❌ Download process failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      alert(
        `Download failed: ${errorMessage}\n\nPlease check the browser console for detailed error information.`,
      );
    }
  };

  const getSelectedDataCount = () => {
    let count = 0;
    analysisData.forEach(location => {
      if (selectedAnalysisLocations.includes(location.analysisLocation)) {
        location.laboratories.forEach(lab => {
          if (
            selectedLaboratories[location.analysisLocation]?.includes(
              lab.laboratory,
            )
          ) {
            lab.analyteGroups.forEach(group => {
              const locationLabKey = `${location.analysisLocation}-${lab.laboratory}`;
              if (
                selectedAnalyteGroups[locationLabKey]?.includes(group.groupName)
              ) {
                group.methods.forEach(method => {
                  const groupKey = `${locationLabKey}-${group.groupName}`;
                  if (selectedMethods[groupKey]?.includes(method.methodName)) {
                    count += method.parameters.length;
                  }
                });
              }
            });
          }
        });
      }
    });
    return count;
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 120px)',
          background: '#ffffff',
          padding: '32px 64px',
          fontFamily: "'Lato', sans-serif",
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            fontSize: '18px',
            color: '#414141',
          }}
        >
          Loading laboratory data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 120px)',
          background: '#ffffff',
          padding: '32px 64px',
          fontFamily: "'Lato', sans-serif",
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            fontSize: '18px',
            color: '#d32f2f',
            background: '#ffebee',
            border: '1px solid #ffcdd2',
            borderRadius: '8px',
            padding: '20px',
            whiteSpace: 'pre-line',
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        background: '#ffffff',
        padding: '32px 64px',
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <div style={{ marginBottom: '40px' }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#03213f',
            marginBottom: '16px',
          }}
        >
          Analysis Download (4-Layer Selection)
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: '#414141',
            lineHeight: 1.5,
            maxWidth: '800px',
          }}
        >
          Select analysis locations, laboratories, analyte groups, and specific
          methods to download water quality data. Navigate through the 4-layer
          hierarchical structure to build your custom dataset. All downloads
          include documentation.
        </p>
      </div>

      {/* COMMENTED OUT - End Date Filter */}
      {/* <div
        style={{
          marginBottom: '40px',
          padding: '20px',
          background: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#05325f',
            marginBottom: '12px',
          }}
        >
          Date Filter
        </h3>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <label style={{ color: '#414141' }}>End Date Filter:</label>
          <input
            type="date"
            value={selectedEndDate}
            onChange={e => setSelectedEndDate(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          <span style={{ fontSize: '14px', color: '#666' }}>
            (Excludes records with end dates older than 5 years from selected
            date)
          </span>
        </div>
      </div> */}

      {/* MOVED FROM ADDITIONAL DATA DOWNLOADS SECTION - 4 Download Buttons */}
      <div
        style={{
          marginBottom: '40px',
          padding: '20px',
          background: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#05325f',
            marginBottom: '16px',
          }}
        >
          Quick Data Downloads
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '20px',
            lineHeight: 1.5,
          }}
        >
          Download CSV files and Excel templates for data analysis and
          reporting.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {/* COMMENTED OUT - Monitoring Sites Download */}
          {/* <div
            style={{
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '12px' }}>📍</span>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#05325f',
                  margin: 0,
                }}
              >
                Monitoring Sites
              </h3>
            </div>
            <p
              style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '16px',
                lineHeight: 1.4,
              }}
            >
              Geographic locations and metadata for water quality monitoring sites.
            </p>
            <button
              onClick={downloadMonitoringSites}
              style={{
                background: '#388e3c',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
              }}
            >
              Download monitoring_sites.csv
            </button>
          </div> */}

          {/* NEW: Inhouse Laboratory Template Download */}
          <div
            style={{
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '12px' }}>🧪</span>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#05325f',
                  margin: 0,
                }}
              >
                Inhouse Laboratory Template
              </h3>
            </div>
            <p
              style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '16px',
                lineHeight: 1.4,
              }}
            >
              Excel template for inhouse laboratory data organization and
              reporting.
            </p>
            <button
              onClick={downloadInhouseLaboratoryTemplate}
              style={{
                background: '#388e3c',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
              }}
            >
              Download inhouse_laboratory_template.xlsx
            </button>
          </div>

          {/* Site Template Download */}
          <div
            style={{
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '12px' }}>🏗️</span>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#05325f',
                  margin: 0,
                }}
              >
                Site Template
              </h3>
            </div>
            <p
              style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '16px',
                lineHeight: 1.4,
              }}
            >
              Excel template for organizing and submitting site location data.
            </p>
            <button
              onClick={downloadSiteTemplate}
              style={{
                background: '#ff9800',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
              }}
            >
              Download site_template.xlsx
            </button>
          </div>

          {/* Project Template Download */}
          <div
            style={{
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '12px' }}>📋</span>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#05325f',
                  margin: 0,
                }}
              >
                Project Template
              </h3>
            </div>
            <p
              style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '16px',
                lineHeight: 1.4,
              }}
            >
              Excel template for project information and metadata organization.
            </p>
            <button
              onClick={downloadProjectTemplate}
              style={{
                background: '#9c27b0',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
              }}
            >
              Download project_template.xlsx
            </button>
          </div>

          {/* Metadata Statement Template Download */}
          <div
            style={{
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '12px' }}>📄</span>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#05325f',
                  margin: 0,
                }}
              >
                Metadata Statement
              </h3>
            </div>
            <p
              style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '16px',
                lineHeight: 1.4,
              }}
            >
              Excel template for creating detailed metadata statements and
              documentation.
            </p>
            <button
              onClick={downloadMetadataStatementTemplate}
              style={{
                background: '#795548',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
              }}
            >
              Download metadata_statement_template.xlsx
            </button>
          </div>
        </div>
      </div>

      {/* 4-Layer Selection Interface */}
      <div style={{ marginBottom: '40px' }}>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#05325f',
            marginBottom: '24px',
          }}
        >
          Step 1: Select Analysis Locations
        </h2>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {analysisData.map(location => (
            <div
              key={location.analysisLocation}
              style={{
                border: `2px solid ${
                  selectedAnalysisLocations.includes(location.analysisLocation)
                    ? '#6bbe27'
                    : '#e0e0e0'
                }`,
                borderRadius: '8px',
                background: selectedAnalysisLocations.includes(
                  location.analysisLocation,
                )
                  ? '#f8fdf5'
                  : '#ffffff',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                onClick={() =>
                  handleAnalysisLocationSelection(location.analysisLocation)
                }
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px',
                  cursor: 'pointer',
                  background: selectedAnalysisLocations.includes(
                    location.analysisLocation,
                  )
                    ? '#6bbe27'
                    : '#f5f5f5',
                  color: selectedAnalysisLocations.includes(
                    location.analysisLocation,
                  )
                    ? '#ffffff'
                    : '#161616',
                  borderRadius: '6px 6px 0 0',
                  transition: 'background 0.3s ease',
                }}
              >
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: 0,
                  }}
                >
                  📍 {location.analysisLocation.toUpperCase()}
                </h3>
                <span
                  style={{
                    fontSize: '14px',
                    transition: 'transform 0.3s ease',
                    transform: expandedAnalysisLocations.includes(
                      location.analysisLocation,
                    )
                      ? 'rotate(0deg)'
                      : 'rotate(-90deg)',
                  }}
                >
                  {expandedAnalysisLocations.includes(location.analysisLocation)
                    ? '▼'
                    : '▶'}
                </span>
              </div>

              {expandedAnalysisLocations.includes(location.analysisLocation) &&
                selectedAnalysisLocations.includes(
                  location.analysisLocation,
                ) && (
                  <div style={{ padding: '20px' }}>
                    <h4
                      style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#05325f',
                        marginBottom: '16px',
                      }}
                    >
                      Step 2: Select Laboratories
                    </h4>

                    {location.laboratories.map(lab => (
                      <div
                        key={lab.laboratory}
                        style={{
                          marginBottom: '16px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                        }}
                      >
                        <div
                          onClick={() =>
                            handleLaboratorySelection(
                              location.analysisLocation,
                              lab.laboratory,
                            )
                          }
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            background: selectedLaboratories[
                              location.analysisLocation
                            ]?.includes(lab.laboratory)
                              ? '#e8f5e8'
                              : '#ffffff',
                            transition: 'background 0.3s ease',
                          }}
                        >
                          <div
                            style={{ display: 'flex', alignItems: 'center' }}
                          >
                            <input
                              type="checkbox"
                              checked={
                                selectedLaboratories[
                                  location.analysisLocation
                                ]?.includes(lab.laboratory) || false
                              }
                              onChange={() =>
                                handleLaboratorySelection(
                                  location.analysisLocation,
                                  lab.laboratory,
                                )
                              }
                              style={{
                                marginRight: '12px',
                                transform: 'scale(1.2)',
                              }}
                            />
                            <span
                              style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#161616',
                              }}
                            >
                              🏢 {lab.laboratory}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '14px',
                              transition: 'transform 0.3s ease',
                            }}
                          >
                            {expandedLaboratories[
                              location.analysisLocation
                            ]?.includes(lab.laboratory)
                              ? '▼'
                              : '▶'}
                          </span>
                        </div>

                        {expandedLaboratories[
                          location.analysisLocation
                        ]?.includes(lab.laboratory) && (
                          <div
                            style={{
                              padding: '16px',
                              background: '#fafafa',
                              borderTop: '1px solid #e0e0e0',
                            }}
                          >
                            <h5
                              style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#05325f',
                                marginBottom: '12px',
                              }}
                            >
                              Step 3: Select Analyte Groups
                            </h5>

                            {lab.analyteGroups.map(group => {
                              const locationLabKey = `${location.analysisLocation}-${lab.laboratory}`;
                              return (
                                <div
                                  key={group.groupName}
                                  style={{
                                    marginBottom: '12px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '6px',
                                  }}
                                >
                                  <div
                                    onClick={() =>
                                      handleAnalyteGroupSelection(
                                        locationLabKey,
                                        group.groupName,
                                      )
                                    }
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '12px 16px',
                                      cursor: 'pointer',
                                      background: selectedAnalyteGroups[
                                        locationLabKey
                                      ]?.includes(group.groupName)
                                        ? '#f0e8ff'
                                        : '#ffffff',
                                      transition: 'background 0.3s ease',
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={
                                          selectedAnalyteGroups[
                                            locationLabKey
                                          ]?.includes(group.groupName) || false
                                        }
                                        onChange={() =>
                                          handleAnalyteGroupSelection(
                                            locationLabKey,
                                            group.groupName,
                                          )
                                        }
                                        style={{
                                          marginRight: '12px',
                                          transform: 'scale(1.2)',
                                        }}
                                      />
                                      <span
                                        style={{
                                          fontSize: '16px',
                                          fontWeight: 'bold',
                                          color: '#161616',
                                        }}
                                      >
                                        📊 {group.groupName}
                                      </span>
                                    </div>
                                    <span
                                      style={{
                                        fontSize: '14px',
                                        transition: 'transform 0.3s ease',
                                      }}
                                    >
                                      {expandedAnalyteGroups[
                                        locationLabKey
                                      ]?.includes(group.groupName)
                                        ? '▼'
                                        : '▶'}
                                    </span>
                                  </div>

                                  {expandedAnalyteGroups[
                                    locationLabKey
                                  ]?.includes(group.groupName) && (
                                    <div
                                      style={{
                                        padding: '16px',
                                        background: '#f8f8f8',
                                        borderTop: '1px solid #e0e0e0',
                                      }}
                                    >
                                      <h6
                                        style={{
                                          fontSize: '16px',
                                          fontWeight: 'bold',
                                          color: '#05325f',
                                          marginBottom: '12px',
                                        }}
                                      >
                                        Step 4: Select Methods
                                      </h6>

                                      {group.methods.map(method => {
                                        const groupKey = `${locationLabKey}-${group.groupName}`;
                                        return (
                                          <div
                                            key={method.methodName}
                                            style={{
                                              marginBottom: '8px',
                                            }}
                                          >
                                            <div
                                              onClick={() =>
                                                handleMethodSelection(
                                                  groupKey,
                                                  method.methodName,
                                                )
                                              }
                                              style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                background: selectedMethods[
                                                  groupKey
                                                ]?.includes(method.methodName)
                                                  ? '#fff3e0'
                                                  : '#ffffff',
                                                borderRadius: '4px',
                                                border: '1px solid #e0e0e0',
                                                transition:
                                                  'background 0.3s ease',
                                              }}
                                            >
                                              <div
                                                style={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                }}
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={
                                                    selectedMethods[
                                                      groupKey
                                                    ]?.includes(
                                                      method.methodName,
                                                    ) || false
                                                  }
                                                  onChange={() =>
                                                    handleMethodSelection(
                                                      groupKey,
                                                      method.methodName,
                                                    )
                                                  }
                                                  style={{
                                                    marginRight: '12px',
                                                    transform: 'scale(1.2)',
                                                  }}
                                                />
                                                <span
                                                  style={{
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    color: '#161616',
                                                  }}
                                                >
                                                  🔬 {method.methodName}
                                                </span>
                                                <span
                                                  style={{
                                                    marginLeft: '8px',
                                                    fontSize: '12px',
                                                    color: '#666',
                                                  }}
                                                >
                                                  ({method.parameters.length}{' '}
                                                  parameters)
                                                </span>
                                              </div>
                                              <span
                                                style={{
                                                  fontSize: '12px',
                                                }}
                                              >
                                                {expandedMethods[
                                                  groupKey
                                                ]?.includes(method.methodName)
                                                  ? '▼'
                                                  : '▶'}
                                              </span>
                                            </div>

                                            {expandedMethods[
                                              groupKey
                                            ]?.includes(method.methodName) && (
                                              <div
                                                style={{
                                                  marginTop: '8px',
                                                  padding: '12px',
                                                  background: '#ffffff',
                                                  borderRadius: '4px',
                                                  border: '1px solid #e0e0e0',
                                                }}
                                              >
                                                <h6
                                                  style={{
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    color: '#2e7d32',
                                                    marginBottom: '8px',
                                                  }}
                                                >
                                                  Parameters (Generic Name +
                                                  Unit):
                                                </h6>
                                                <div
                                                  style={{
                                                    display: 'grid',
                                                    gridTemplateColumns:
                                                      'repeat(auto-fit, minmax(300px, 1fr))',
                                                    gap: '8px',
                                                  }}
                                                >
                                                  {method.parameters.map(
                                                    (param, idx) => (
                                                      <div
                                                        key={idx}
                                                        style={{
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          padding: '8px',
                                                          background: '#e8f5e8',
                                                          borderRadius: '4px',
                                                          border:
                                                            '1px solid #c8e6c9',
                                                        }}
                                                      >
                                                        <span
                                                          style={{
                                                            fontSize: '12px',
                                                            color: '#2e7d32',
                                                          }}
                                                        >
                                                          ⚗️{' '}
                                                          <strong>
                                                            {param.genericName}
                                                          </strong>{' '}
                                                          ({param.unit})
                                                        </span>
                                                      </div>
                                                    ),
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>

      {/* COMMENTED OUT - Additional CSV Downloads Section */}
      {/* <div
        style={{
          borderTop: '2px solid #e0e0e0',
          paddingTop: '24px',
          marginBottom: '32px',
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#05325f',
            marginBottom: '16px',
          }}
        >
          Additional Data Downloads
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '20px',
            lineHeight: 1.5,
          }}
        >
          Download additional CSV files and Excel templates for data analysis and reporting.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Sample Data Download - COMMENTED OUT */}
      {/* <div
            style={{
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '12px' }}>📊</span>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#05325f',
                  margin: 0,
                }}
              >
                Sample Data
              </h3>
            </div>
            <p
              style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '16px',
                lineHeight: 1.4,
              }}
            >
              Water quality measurements and analytical results from laboratory analyses.
            </p>
            <button
              onClick={downloadSampleData}
              style={{
                background: '#1976d2',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
              }}
            >
              Download sample_data.csv
            </button>
          </div> */}

      {/* MOVED TO TOP - Monitoring Sites Download */}
      {/* <div
            style={{
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '12px' }}>📍</span>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#05325f',
                  margin: 0,
                }}
              >
                Monitoring Sites
              </h3>
            </div>
            <p
              style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '16px',
                lineHeight: 1.4,
              }}
            >
              Geographic locations and metadata for water quality monitoring sites.
            </p>
            <button
              onClick={downloadMonitoringSites}
              style={{
                background: '#388e3c',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
              }}
            >
              Download monitoring_sites.csv
            </button>
          </div> */}

      {/* MOVED TO TOP - Site Template Download */}
      {/* <div
            style={{
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '12px' }}>🏗️</span>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#05325f',
                  margin: 0,
                }}
              >
                Site Template
              </h3>
            </div>
            <p
              style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '16px',
                lineHeight: 1.4,
              }}
            >
              Excel template for organizing and submitting site location data.
            </p>
            <button
              onClick={downloadSiteTemplate}
              style={{
                background: '#ff9800',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
              }}
            >
              Download site_template.xlsx
            </button>
          </div> */}

      {/* MOVED TO TOP - Project Template Download */}
      {/* <div
            style={{
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '12px' }}>📋</span>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#05325f',
                  margin: 0,
                }}
              >
                Project Template
              </h3>
            </div>
            <p
              style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '16px',
                lineHeight: 1.4,
              }}
            >
              Excel template for project information and metadata organization.
            </p>
            <button
              onClick={downloadProjectTemplate}
              style={{
                background: '#9c27b0',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
              }}
            >
              Download project_template.xlsx
            </button>
          </div> */}

      {/* MOVED TO TOP - Metadata Statement Template Download */}
      {/* <div
            style={{
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '12px' }}>📄</span>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#05325f',
                  margin: 0,
                }}
              >
                Metadata Statement
              </h3>
            </div>
            <p
              style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '16px',
                lineHeight: 1.4,
              }}
            >
              Excel template for creating detailed metadata statements and documentation.
            </p>
            <button
              onClick={downloadMetadataStatementTemplate}
              style={{
                background: '#795548',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
              }}
            >
              Download metadata_statement_template.xlsx
            </button>
          </div> */}
      {/* </div>
      </div> */}

      {/* Download Section */}
      <div
        style={{
          borderTop: '2px solid #e0e0e0',
          paddingTop: '24px',
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#05325f',
            marginBottom: '16px',
          }}
        >
          Custom Analysis Download
        </h2>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f5f5f5',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <div style={{ color: '#414141' }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '4px',
              }}
            >
              Selected Data Points:{' '}
              <span style={{ color: '#6bbe27' }}>{getSelectedDataCount()}</span>
            </div>
            <div
              style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '4px',
              }}
            >
              ZIP package will include CSV files + documentation (README.md)
            </div>
            {/* COMMENTED OUT - Date filter info */}
            {/* {selectedEndDate && (
              <div
                style={{
                  fontSize: '14px',
                  color: '#1976d2',
                }}
              >
                🗓️ Filtered by end date: {selectedEndDate} (excluding records
                older than 5 years)
              </div>
            )} */}
          </div>
          <button
            onClick={downloadAnalysisData}
            disabled={getSelectedDataCount() === 0}
            style={{
              background: getSelectedDataCount() > 0 ? '#6bbe27' : '#cccccc',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: getSelectedDataCount() > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              if (getSelectedDataCount() > 0) {
                e.currentTarget.style.background = '#5ba322';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={e => {
              if (getSelectedDataCount() > 0) {
                e.currentTarget.style.background = '#6bbe27';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            Download ZIP Package
          </button>
        </div>
      </div>

      {/* Data Structure Info */}
      <div
        style={{
          marginTop: '32px',
          padding: '16px',
          background: '#e3f2fd',
          borderRadius: '8px',
          border: '1px solid #bbdefb',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#1565c0',
            marginBottom: '8px',
          }}
        >
          Data Structure Information
        </h3>
        <div
          style={{
            fontSize: '14px',
            color: '#1976d2',
            lineHeight: 1.5,
          }}
        >
          <p style={{ margin: '4px 0' }}>
            <strong>Download Package:</strong> ZIP file with CSV data +
            README.md documentation
          </p>
          <p style={{ margin: '4px 0' }}>
            <strong>Hierarchy:</strong> Analysis Location → Laboratory → Analyte
            Group → Method → Parameters
          </p>
          <p style={{ margin: '4px 0' }}>
            <strong>CSV Format:</strong> Row 1: Laboratory + Methods, Row 2:
            Headers + Generic Names, Row 3: Units
          </p>
          <p style={{ margin: '4px 0' }}>
            <strong>Deduplication:</strong> Based on composite key (Generic Name
            + Unit)
          </p>
          <p style={{ margin: '4px 0' }}>
            <strong>Date Filtering:</strong> Excludes records with end dates
            more than 5 years before selected date
          </p>
        </div>
      </div>
    </div>
  );
}
