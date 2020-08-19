import { Pos } from '../../solver';

function getSplitGroups(groups: Pos[][], size = 5): Pos[][] {
  const newGroups: Pos[][] = [];

  for (const group of groups) {
    if (group.length <= size) {
      newGroups.push(group);
      continue;
    }

    for (let i = 0; i < group.length; i += size) {
      newGroups.push(group.slice(i, i + size));
    }
  }

  return newGroups;
}

function getStaggerValues(groups: Pos[][]): number[][] {
  const staggers: number[][] = [];

  for (const group of groups) {
    const values: number[] = [];
    for (let i = 0; i < group.length; i++) {
      values[i] = i;
    }
    staggers.push(values);
  }

  return staggers;
}

export { getSplitGroups, getStaggerValues };
