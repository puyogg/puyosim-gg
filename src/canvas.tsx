import React from 'react';
import { ChainSolver } from './solver';
import { DEFAULT_SETTINGS } from './solver/constants';

const Canvas: React.FunctionComponent = () => {
  // eslint-disable-next-line prettier/prettier
  const chain = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 6, 5, 0, 3, 4, 2, 6, 5, 0, 3, 3, 4, 2, 6, 5, 4, 4, 1, 2, 6, 5];

  const solver = new ChainSolver(chain, DEFAULT_SETTINGS);
  solver.simulate();

  console.log(solver.states);
  solver.logStates();

  return <p>Life is quite the struggle, huh?</p>;
};

export { Canvas };
