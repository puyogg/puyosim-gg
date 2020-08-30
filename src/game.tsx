import React from 'react';
import { useEffect, useRef } from 'react';

import { ChainSolver } from './solver';
import { DEFAULT_SETTINGS } from './solver/constants';

import { Chainsim, createChainsim } from './chainsim';

const chain = [
  3,
  0,
  0,
  5,
  0,
  2,
  4,
  4,
  4,
  4,
  2,
  3,
  2,
  2,
  6,
  5,
  5,
  2,
  2,
  3,
  3,
  6,
  2,
  3,
  3,
  6,
  6,
  5,
  2,
  3,
  2,
  2,
  3,
  4,
  6,
  3,
  4,
  3,
  4,
  6,
  2,
  2,
  2,
  2,
  3,
  4,
  6,
  2,
  4,
  2,
  3,
  4,
  6,
  5,
  4,
  3,
  5,
  6,
  4,
  5,
  4,
  2,
  3,
  5,
  6,
  4,
  2,
  3,
  5,
  6,
  4,
  5,
  2,
  3,
  5,
  6,
  4,
  5,
];

// eslint-disable-next-line prettier/prettier
const Game: React.FunctionComponent = () => {
  const gameDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setupChainsim = async () => {
      const chainsim = await createChainsim(
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
    };

    setupChainsim();
  }, []);
  // const solver = new ChainSolver(chain, DEFAULT_SETTINGS);
  // solver.simulate();

  // console.log(solver.states);
  // solver.logStates();

  return <div ref={gameDiv}></div>;
};

export { Game };
