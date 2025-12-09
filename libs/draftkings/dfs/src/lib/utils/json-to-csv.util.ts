import { DraftKingsEntry } from '@bryans-nx-workspace/draftkings-shared';

export const convertJsonToCsv = (jsonData: DraftKingsEntry[]): string => {
  if (!jsonData || jsonData.length === 0) {
    return '';
  }

  const headers = Object.keys(jsonData[0]); // Extract headers from the first object
  const csvRows = [];

  // Add headers as the first row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of jsonData) {
    const values = headers.map((header) => {
      const value = (row as any)[header];
      // Handle potential commas within values by enclosing them in quotes
      return typeof value === 'string' && value.includes(',')
        ? `"${value}"`
        : value;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

export const downloadCsvFile = (csvString: string, filename = 'data.csv') => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    // Feature detection for download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the object URL
  } else {
    // Fallback for browsers that don't support the download attribute
    window.open(URL.createObjectURL(blob));
  }
};
