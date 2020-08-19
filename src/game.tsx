import React from 'react';
import { useEffect, useRef } from 'react';

import { ChainSolver } from './solver';
import { DEFAULT_SETTINGS } from './solver/constants';

import { Chainsim } from './chainsim';

// eslint-disable-next-line prettier/prettier
const chain = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  6,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  5,
  0,
  1,
  0,
  3,
  0,
  0,
  1,
  0,
  3,
  0,
  0,
  0,
  0,
  0,
  2,
  3,
  0,
  0,
  0,
  4,
  3,
  1,
  5,
  5,
  0,
  4,
  3,
  7,
  1,
  5,
  0,
  9,
  3,
  4,
  5,
  8,
  7,
  9,
  2,
  3,
  4,
  5,
  6,
  7,
  2,
  3,
  4,
  5,
  6,
  7,
  2,
  3,
  4,
  5,
  6,
  7,
];

const Game: React.FunctionComponent = () => {
  const gameDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chainsim = new Chainsim(
      {
        width: 630,
        height: 1000,
        transparent: true,
        antialias: true,
        preserveDrawingBuffer: true,
      },
      chain,
    );

    chainsim.mountGame(gameDiv.current as HTMLElement);
  }, []);
  // const solver = new ChainSolver(chain, DEFAULT_SETTINGS);
  // solver.simulate();

  // console.log(solver.states);
  // solver.logStates();

  return <div ref={gameDiv}></div>;
};

export { Game };
