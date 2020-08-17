import React from 'react';
import { render } from 'react-dom';
import { Game } from './game';

const App: React.FunctionComponent = () => <Game />;

render(<App />, document.getElementById('root'));
