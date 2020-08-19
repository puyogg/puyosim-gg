function countGarbageIcons(count: number): string[] {
  const icons: string[] = [];
  countCrown(count, icons, 0);
  return icons;
}

function countCrown(count: number, icons: string[], i: number): string[] {
  if (i < 6) {
    if (count - 720 >= 0) {
      icons.push('crown.png');
      return countCrown(count - 720, icons, i + 1);
    } else {
      return countMoon(count, icons, i);
    }
  }
  return icons;
}

function countMoon(count: number, icons: string[], i: number): string[] {
  if (i < 6) {
    if (count - 360 >= 0) {
      icons.push('moon.png');
      return countMoon(count - 360, icons, i + 1);
    } else {
      return countStar(count, icons, i);
    }
  }
  return icons;
}

function countStar(count: number, icons: string[], i: number): string[] {
  if (i < 6) {
    if (count - 180 >= 0) {
      icons.push('star.png');
      return countStar(count - 180, icons, i + 1);
    } else {
      return countRock(count, icons, i);
    }
  }
  return icons;
}

function countRock(count: number, icons: string[], i: number): string[] {
  if (i < 6) {
    if (count - 30 >= 0) {
      icons.push('rock.png');
      return countRock(count - 30, icons, i + 1);
    } else {
      return countLine(count, icons, i);
    }
  }
  return icons;
}

function countLine(count: number, icons: string[], i: number): string[] {
  if (i < 6) {
    if (count - 6 >= 0) {
      icons.push('line.png');
      return countLine(count - 6, icons, i + 1);
    } else {
      return countUnit(count, icons, i);
    }
  }
  return icons;
}

function countUnit(count: number, icons: string[], i: number): string[] {
  if (i < 6) {
    if (count - 1 >= 0) {
      icons.push('unit.png');
      return countUnit(count - 1, icons, i + 1);
    }
  }
  return icons;
}

export { countGarbageIcons };
