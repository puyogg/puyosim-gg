import React from 'react';
import { render } from 'react-dom';
import { Canvas } from './canvas';

const App: React.FunctionComponent = () => <Canvas />;

render(<App />, document.getElementById('root'));
