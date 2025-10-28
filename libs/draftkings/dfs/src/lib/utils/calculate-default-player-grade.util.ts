export const calculateGrade = (sortOrder: number, penalty = 0): number => {
  return Number((10 - (sortOrder + 1) / 10 - 0.9 - penalty).toFixed(2));
};
