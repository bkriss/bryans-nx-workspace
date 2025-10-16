import { Player, TightEnd } from '../models';

export const findCheapestPlayersSalary = (players: Player[]): number => {
  const cheapestPlayersSalary = players.reduce((accumulator, currentValue) => {
    return currentValue.salary < accumulator
      ? currentValue.salary
      : accumulator;
  }, Infinity); // Initialize accumulator with a value guaranteed to be larger than any possible salary

  return cheapestPlayersSalary;
};

export const findCheapestPlayer = (players: Player[]): Player => {
  const cheapestPlayer = players.reduce((accumulator, currentObject) => {
    if (currentObject.salary < accumulator.salary) {
      return currentObject;
    } else {
      return accumulator;
    }
  }, players[0]); // Initialize the accumulator with the first object in the array

  return cheapestPlayer;
};

export const findCheapestTightEnd = (players: TightEnd[]): TightEnd => {
  const cheapestPlayer = players.reduce((accumulator, currentObject) => {
    if (currentObject.salary < accumulator.salary) {
      return currentObject;
    } else {
      return accumulator;
    }
  }, players[0]); // Initialize the accumulator with the first object in the array

  return cheapestPlayer;
};

export const findSecondCheapestPlayersSalary = (players: Player[]): number => {
  const result = players.reduce(
    (accumulator, current) => {
      if (current.salary < accumulator.smallest) {
        accumulator.secondSmallest = accumulator.smallest;
        accumulator.smallest = current.salary;
      } else if (
        current.salary < accumulator.secondSmallest &&
        current.salary !== accumulator.smallest
      ) {
        accumulator.secondSmallest = current.salary;
      }
      return accumulator;
    },
    { smallest: Infinity, secondSmallest: Infinity }
  );

  if (result.secondSmallest === Infinity) {
    // This handles cases where all salaries are the same, or there's only one distinct salary
    throw new Error('Could not find a distinct second smallest salary.');
  }

  return result.secondSmallest;
};

export const findThirdCheapestPlayersSalary = (players: Player[]): number => {
  const propertyToSortBy = 'salary'; // The property to find the third smallest value of

  // Sort the array of objects based on the specified property in ascending order
  const sortedData = players.sort(
    (a, b) => a[propertyToSortBy] - b[propertyToSortBy]
  );
  let thirdSmallestValue = 0;

  // Check if there are at least three elements to find the third smallest
  if (sortedData.length >= 3) {
    thirdSmallestValue = sortedData[2][propertyToSortBy];
    console.log(
      `The third smallest value for '${propertyToSortBy}' is: ${thirdSmallestValue}`
    );
  } else {
    console.log(
      `There are not enough elements to find the third smallest value for '${propertyToSortBy}'.`
    );
  }

  return thirdSmallestValue;
};
