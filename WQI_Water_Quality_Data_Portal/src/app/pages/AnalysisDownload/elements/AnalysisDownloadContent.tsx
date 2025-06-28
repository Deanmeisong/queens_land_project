import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';

interface CSVRow {
  laboratory: string;
  lab_analysis_method_short_name: string;
  start_date: string;
  end_date: string;
  com_lab_analysis_method: string;
  subvariable_number: string;
  generic_name: string;
  unit: string;
  lor: string;
  lor_unit: string;
  inhouse_lab_flag: string;
}

interface GenericNameItem {
  name: string;
}

interface MethodItem {
  methodName: string;
  genericNames: GenericNameItem[];
}

interface LaboratoryItem {
  laboratory: string;
  methods: MethodItem[];
}

export default function AnalysisDownloadContent() {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

        // Expected headers based on your CSV structure
        const expectedHeaders = [
          'laboratory',
          'lab_analysis_method_short_name',
          'start_date',
          'end_date',
          'com_lab_analysis_method',
          'subvariable_number',
          'generic_name',
          'unit',
          'lor',
          'lor_unit',
          'inhouse_lab_flag',
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

            if (values.length >= 7) {
              // Minimum required columns
              const row: CSVRow = {
                laboratory: values[0] || '',
                lab_analysis_method_short_name: values[1] || '',
                start_date: values[2] || '',
                end_date: values[3] || '',
                com_lab_analysis_method: values[4] || '',
                subvariable_number: values[5] || '',
                generic_name: values[6] || '',
                unit: values[7] || '',
                lor: values[8] || '',
                lor_unit: values[9] || '',
                inhouse_lab_flag: values[10] || '',
              };

              // Only add rows with valid required data
              if (
                row.laboratory &&
                row.lab_analysis_method_short_name &&
                row.generic_name
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
            laboratory: row.laboratory,
            method: row.lab_analysis_method_short_name,
            generic_name: row.generic_name,
          });
        });

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
        errorMessage += '4. Ensure file is saved as UTF-8 encoding';

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCSVData();
  }, []);

  // Process CSV data into hierarchical structure
  const analysisData = useMemo((): LaboratoryItem[] => {
    if (!csvData.length) return [];

    const labMap = new Map<string, Map<string, Set<string>>>();

    // Group data by laboratory -> method -> generic_name
    csvData.forEach(row => {
      if (
        !row.laboratory ||
        !row.lab_analysis_method_short_name ||
        !row.generic_name
      )
        return;

      if (!labMap.has(row.laboratory)) {
        labMap.set(row.laboratory, new Map());
      }

      const methodMap = labMap.get(row.laboratory)!;
      if (!methodMap.has(row.lab_analysis_method_short_name)) {
        methodMap.set(row.lab_analysis_method_short_name, new Set());
      }

      methodMap.get(row.lab_analysis_method_short_name)!.add(row.generic_name);
    });

    // Convert to array structure
    const result: LaboratoryItem[] = [];
    labMap.forEach((methodMap, laboratory) => {
      const methods: MethodItem[] = [];
      methodMap.forEach((genericNameSet, methodName) => {
        const genericNames: GenericNameItem[] = Array.from(genericNameSet).map(
          name => ({
            name,
          }),
        );
        methods.push({ methodName, genericNames });
      });
      result.push({ laboratory, methods });
    });

    return result;
  }, [csvData]);

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

  // const downloadCSV = async () => {
  //   // Fixed columns that are always present
  //   const fixedColumns = [
  //     'Project Code',
  //     'Site Code',
  //     'Sampling Date Time',
  //     'Sample Unique Identifier',
  //     'Sample Collection Method',
  //     'Laboratory',
  //     'Analysis Method',
  //     'Depth (m)',
  //     'Comment (max 255 characters)',
  //   ];

  //   // Get all selected generic names to use as additional column headers
  //   const selectedColumns: string[] = [];

  //   analysisData.forEach(lab => {
  //     if (selectedLabs.includes(lab.laboratory)) {
  //       lab.methods.forEach(method => {
  //         const methodKey = `${lab.laboratory}-${method.methodName}`;
  //         if (selectedMethods[lab.laboratory]?.includes(method.methodName)) {
  //           method.genericNames.forEach(generic => {
  //             if (selectedGenericNames[methodKey]?.includes(generic.name)) {
  //               if (!selectedColumns.includes(generic.name)) {
  //                 selectedColumns.push(generic.name);
  //               }
  //             }
  //           });
  //         }
  //       });
  //     }
  //   });

  //   // Combine fixed columns with selected columns
  //   const allColumns = [...fixedColumns, ...selectedColumns];

  //   // Create CSV content with ONLY header row containing fixed + selected columns
  //   const analysisCSVContent = allColumns.map(col => `"${col}"`).join(',');

  //   try {
  //     console.log('📦 Downloading ZIP file with all CSV data...');

  //     // Send POST request to backend with analysis CSV content
  //     const response = await fetch('http://localhost:3001/api/download-zip', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         analysisCSVContent,
  //         filename: 'analysis_data.csv',
  //       }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.details || 'Failed to download ZIP file');
  //     }

  //     // Get the ZIP file as blob
  //     const blob = await response.blob();

  //     // Create download link
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'water_quality_data.zip';
  //     a.click();
  //     window.URL.revokeObjectURL(url);

  //     console.log('✅ ZIP file downloaded successfully');
  //   } catch (err) {
  //     console.error('❌ Error downloading ZIP file:', err);
  //     const error = err as Error;
  //     alert(`Failed to download ZIP file: ${error.message || 'Unknown error'}`);
  //   }
  // };

  // const downloadCSV = async () => {
  //   // Fixed columns that are always present
  //   const fixedColumns = [
  //     'Project Code',
  //     'Site Code',
  //     'Sampling Date Time',
  //     'Sample Unique Identifier',
  //     'Sample Collection Method',
  //     'Laboratory',
  //     'Analysis Method',
  //     'Depth (m)',
  //     'Comment (max 255 characters)',
  //   ];

  //   // Get all selected generic names with their parent method names
  //   const selectedColumnsWithParents: Array<{
  //     columnName: string;
  //     parentMethod: string;
  //   }> = [];

  //   analysisData.forEach(lab => {
  //     if (selectedLabs.includes(lab.laboratory)) {
  //       lab.methods.forEach(method => {
  //         const methodKey = `${lab.laboratory}-${method.methodName}`;
  //         if (selectedMethods[lab.laboratory]?.includes(method.methodName)) {
  //           method.genericNames.forEach(generic => {
  //             if (selectedGenericNames[methodKey]?.includes(generic.name)) {
  //               // Check if this column name is already added
  //               if (
  //                 !selectedColumnsWithParents.some(
  //                   col => col.columnName === generic.name,
  //                 )
  //               ) {
  //                 selectedColumnsWithParents.push({
  //                   columnName: generic.name,
  //                   parentMethod: method.methodName,
  //                 });
  //               }
  //             }
  //           });
  //         }
  //       });
  //     }
  //   });

  //   // Build first header row (parent headers)
  //   const firstHeaderRow = [
  //     // "static" for all fixed columns
  //     ...fixedColumns.map(() => 'static'),
  //     // Parent method names for selected columns
  //     ...selectedColumnsWithParents.map(col => col.parentMethod),
  //   ];

  //   // Build second header row (column headers)
  //   const secondHeaderRow = [
  //     // Fixed column names
  //     ...fixedColumns,
  //     // Selected parameter names
  //     ...selectedColumnsWithParents.map(col => col.columnName),
  //   ];

  //   // Create CSV content with double headers
  //   const firstHeaderCSV = firstHeaderRow.map(col => `"${col}"`).join(',');
  //   const secondHeaderCSV = secondHeaderRow.map(col => `"${col}"`).join(',');
  //   const analysisCSVContent = `${firstHeaderCSV}\n${secondHeaderCSV}`;

  //   try {
  //     console.log('📦 Downloading ZIP file with all CSV data...');
  //     console.log(
  //       '🔍 DEBUG - Selected columns with parents:',
  //       selectedColumnsWithParents,
  //     );
  //     console.log('🔍 DEBUG - First header row:', firstHeaderRow);
  //     console.log('🔍 DEBUG - Second header row:', secondHeaderRow);
  //     console.log('🔍 DEBUG - Analysis CSV content:', analysisCSVContent);

  //     // Send POST request to backend with analysis CSV content
  //     const response = await fetch('http://localhost:3001/api/download-zip', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         analysisCSVContent,
  //         filename: 'analysis_data.csv',
  //       }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.details || 'Failed to download ZIP file');
  //     }

  //     // Get the ZIP file as blob
  //     const blob = await response.blob();

  //     // Create download link
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'water_quality_data.zip';
  //     a.click();
  //     window.URL.revokeObjectURL(url);

  //     console.log('✅ ZIP file downloaded successfully');
  //   } catch (err) {
  //     console.error('❌ Error downloading ZIP file:', err);
  //     const error = err as Error;
  //     alert(`Failed to download ZIP file: ${error.message || 'Unknown error'}`);
  //   }
  // };

  // Updated downloadCSV function for multiple laboratory files
  const downloadCSV = async () => {
    // Fixed columns that are always present
    const fixedColumns = [
      'Project Code',
      'Site Code',
      'Sampling Date Time',
      'Sample Unique Identifier',
      'Sample Collection Method',
      'Laboratory',
      'Analysis Method',
      'Depth (m)',
      'Comment (max 255 characters)',
    ];

    // Build separate CSV files for each selected laboratory
    const laboratoryFiles: Array<{
      filename: string;
      content: string;
    }> = [];

    // Loop through each selected laboratory
    selectedLabs.forEach(labName => {
      console.log(`🏢 Processing laboratory: ${labName}`);

      // Find the laboratory data
      const labData = analysisData.find(lab => lab.laboratory === labName);
      if (!labData) {
        console.warn(`⚠️ Laboratory data not found for: ${labName}`);
        return;
      }

      // Get selected parameters for this specific laboratory
      const labSelectedColumnsWithParents: Array<{
        columnName: string;
        parentMethod: string;
      }> = [];

      labData.methods.forEach(method => {
        const methodKey = `${labName}-${method.methodName}`;

        // Check if this method is selected for this lab
        if (selectedMethods[labName]?.includes(method.methodName)) {
          method.genericNames.forEach(generic => {
            // Check if this parameter is selected
            if (selectedGenericNames[methodKey]?.includes(generic.name)) {
              // Check if this column name is already added (avoid duplicates)
              if (
                !labSelectedColumnsWithParents.some(
                  col => col.columnName === generic.name,
                )
              ) {
                labSelectedColumnsWithParents.push({
                  columnName: generic.name,
                  parentMethod: method.methodName,
                });
              }
            }
          });
        }
      });

      console.log(
        `📊 ${labName} selected parameters:`,
        labSelectedColumnsWithParents,
      );

      // Build double headers for this laboratory
      const firstHeaderRow = [
        // "static" for all fixed columns
        ...fixedColumns.map(() => 'static'),
        // Parent method names for this lab's selected columns
        ...labSelectedColumnsWithParents.map(col => col.parentMethod),
      ];

      const secondHeaderRow = [
        // Fixed column names
        ...fixedColumns,
        // This lab's selected parameter names
        ...labSelectedColumnsWithParents.map(col => col.columnName),
      ];

      // Create CSV content with double headers for this laboratory
      const firstHeaderCSV = firstHeaderRow.map(col => `"${col}"`).join(',');
      const secondHeaderCSV = secondHeaderRow.map(col => `"${col}"`).join(',');
      const labCSVContent = `${firstHeaderCSV}\n${secondHeaderCSV}`;

      // Add to laboratory files array
      laboratoryFiles.push({
        filename: `${labName}.csv`,
        content: labCSVContent,
      });

      console.log(`✅ Generated CSV for ${labName}:`, {
        filename: `${labName}.csv`,
        firstHeader: firstHeaderRow,
        secondHeader: secondHeaderRow,
        parameterCount: labSelectedColumnsWithParents.length,
      });
    });

    console.log(
      `📦 Total laboratory files generated: ${laboratoryFiles.length}`,
    );
    console.log('🔍 DEBUG - All laboratory files:', laboratoryFiles);

    try {
      console.log(
        '📦 Downloading ZIP file with multiple laboratory CSV files...',
      );

      // Send POST request to backend with multiple laboratory CSV files
      const response = await fetch('http://localhost:3001/api/download-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          laboratoryFiles,
          // Remove the old single file parameters
          // analysisCSVContent and filename are no longer needed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to download ZIP file');
      }

      // Get the ZIP file as blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'water_quality_data.zip';
      a.click();
      window.URL.revokeObjectURL(url);

      console.log('✅ ZIP file downloaded successfully');
    } catch (err) {
      console.error('❌ Error downloading ZIP file:', err);
      const error = err as Error;
      alert(`Failed to download ZIP file: ${error.message || 'Unknown error'}`);
    }
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
          Analysis Download
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: '#414141',
            lineHeight: 1.5,
            maxWidth: '800px',
          }}
        >
          Select laboratories, analysis methods, and specific parameters to
          download water quality data. Navigate through the hierarchical
          structure to build your custom dataset.
        </p>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#05325f',
            marginBottom: '24px',
          }}
        >
          Step 1: Select Laboratories
        </h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {analysisData.map(lab => (
            <div
              key={lab.laboratory}
              style={{
                border: `2px solid ${
                  selectedLabs.includes(lab.laboratory) ? '#6bbe27' : '#e0e0e0'
                }`,
                borderRadius: '8px',
                background: selectedLabs.includes(lab.laboratory)
                  ? '#f8fdf5'
                  : '#ffffff',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                if (!selectedLabs.includes(lab.laboratory)) {
                  e.currentTarget.style.borderColor = '#6bbe27';
                }
              }}
              onMouseLeave={e => {
                if (!selectedLabs.includes(lab.laboratory)) {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }
              }}
            >
              <div
                onClick={() => handleLabSelection(lab.laboratory)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px',
                  cursor: 'pointer',
                  background: selectedLabs.includes(lab.laboratory)
                    ? '#6bbe27'
                    : '#f5f5f5',
                  color: selectedLabs.includes(lab.laboratory)
                    ? '#ffffff'
                    : '#161616',
                  borderRadius: '6px 6px 0 0',
                  transition: 'background 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = selectedLabs.includes(
                    lab.laboratory,
                  )
                    ? '#5ba322'
                    : '#e8e8e8';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = selectedLabs.includes(
                    lab.laboratory,
                  )
                    ? '#6bbe27'
                    : '#f5f5f5';
                }}
              >
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: 0,
                  }}
                >
                  {lab.laboratory}
                </h3>
                <span
                  style={{
                    fontSize: '14px',
                    transition: 'transform 0.3s ease',
                    transform: expandedLabs.includes(lab.laboratory)
                      ? 'rotate(0deg)'
                      : 'rotate(-90deg)',
                  }}
                >
                  {expandedLabs.includes(lab.laboratory) ? '▼' : '▶'}
                </span>
              </div>

              {expandedLabs.includes(lab.laboratory) &&
                selectedLabs.includes(lab.laboratory) && (
                  <div style={{ padding: '20px' }}>
                    <h4
                      style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#05325f',
                        marginBottom: '16px',
                      }}
                    >
                      Step 2: Select Analysis Methods
                    </h4>
                    {lab.methods.map(method => (
                      <div
                        key={method.methodName}
                        style={{
                          marginBottom: '16px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                        }}
                      >
                        <div
                          onClick={() =>
                            handleMethodSelection(
                              lab.laboratory,
                              method.methodName,
                            )
                          }
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            background: selectedMethods[
                              lab.laboratory
                            ]?.includes(method.methodName)
                              ? '#e8f5e8'
                              : '#ffffff',
                            transition: 'background 0.3s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#f0f8f0';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = selectedMethods[
                              lab.laboratory
                            ]?.includes(method.methodName)
                              ? '#e8f5e8'
                              : '#ffffff';
                          }}
                        >
                          <input
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
                            style={{
                              marginRight: '12px',
                              transform: 'scale(1.2)',
                            }}
                          />
                          <span
                            style={{
                              fontSize: '16px',
                              color: '#161616',
                              flex: 1,
                            }}
                          >
                            {method.methodName}
                          </span>
                          <span
                            style={{
                              fontSize: '14px',
                              transition: 'transform 0.3s ease',
                            }}
                          >
                            {expandedMethods[lab.laboratory]?.includes(
                              method.methodName,
                            )
                              ? '▼'
                              : '▶'}
                          </span>
                        </div>

                        {expandedMethods[lab.laboratory]?.includes(
                          method.methodName,
                        ) && (
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
                              Step 3: Select Parameters
                            </h5>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns:
                                  'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '8px',
                              }}
                            >
                              {method.genericNames.map(generic => {
                                const methodKey = `${lab.laboratory}-${method.methodName}`;
                                return (
                                  <div
                                    key={generic.name}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      padding: '8px',
                                      background: '#ffffff',
                                      borderRadius: '4px',
                                      border: '1px solid #e0e0e0',
                                      transition: 'background 0.3s ease',
                                    }}
                                    onMouseEnter={e => {
                                      e.currentTarget.style.background =
                                        '#f8f8f8';
                                    }}
                                    onMouseLeave={e => {
                                      e.currentTarget.style.background =
                                        '#ffffff';
                                    }}
                                  >
                                    <input
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
                                      style={{
                                        marginRight: '12px',
                                        transform: 'scale(1.2)',
                                      }}
                                    />
                                    <span
                                      style={{
                                        fontSize: '14px',
                                        color: '#414141',
                                      }}
                                    >
                                      {generic.name}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
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

      <div
        style={{
          borderTop: '2px solid #e0e0e0',
          paddingTop: '24px',
        }}
      >
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
          <div
            style={{
              fontSize: '16px',
              color: '#414141',
            }}
          >
            Selected Data Points: <strong>{getSelectedDataCount()}</strong>
          </div>
          <button
            onClick={downloadCSV}
            style={{
              background: '#6bbe27',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#5ba322';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#6bbe27';
            }}
          >
            Download ZIP Package
          </button>
        </div>
      </div>
    </div>
  );
}
