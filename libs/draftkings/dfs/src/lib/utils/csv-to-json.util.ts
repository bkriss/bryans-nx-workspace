export const csvToJson = (csvString: string): any[] => {
  const rows = csvString.split('\n');
  const headers = rows[0].split(',');
  const jsonData = [];

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i].split(',');
    const obj: any = {};

    for (let j = 0; j < headers.length; j++) {
      const key = headers[j].trim();
      const value = values[j] ? values[j].trim() : ''; // Handle potential missing values
      obj[key] = value;
    }

    jsonData.push(obj);
  }

  return jsonData;
};
