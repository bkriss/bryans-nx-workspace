export const calculateGrade = (sortOrder: number): number => {
  return Number((10 - (sortOrder + 1) / 10 - 0.9).toFixed(2));
};
