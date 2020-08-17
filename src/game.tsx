import React from 'react';
import { useEffect, useRef } from 'react';

import { ChainSolver } from './solver';
import { DEFAULT_SETTINGS } from './solver/constants';

import { Chainsim } from './chainsim';

// eslint-disable-next-line prettier/prettier
const chain = [
  0,
  3,
  3,
  3,
  3,
  3,
  3,
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
  3,
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
  0,
  0,
  0,
  0,
  0,
  0,
  3,
  0,
  0,
  0,
  0,
  0,
  3,
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
  0,
  0,
  2,
  6,
  5,
  0,
  3,
  4,
  2,
  6,
  5,
  0,
  3,
  3,
  4,
  2,
  6,
  5,
  4,
  4,
  1,
  2,
  6,
  5,
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
