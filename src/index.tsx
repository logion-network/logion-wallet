import { createRoot } from 'react-dom/client';
import moment from 'moment';
import 'moment/locale/en-gb';

import App from './App';
import reportWebVitals from './reportWebVitals';

import './index.scss';

moment.locale('en-gb');

const root = createRoot(document.getElementById('root')!);
root.render(
    <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
