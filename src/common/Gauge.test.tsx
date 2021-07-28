import { shallowRender } from '../tests';

import Gauge from './Gauge';

test("renders arc", () => {
    testGauge('arc');
});

function testGauge(type: 'arc' | 'linear') {
    const result = shallowRender(<Gauge
        readingIntegerPart={ "99" }
        readingDecimalPart={ "00" }
        unit={ "mLOG" }
        level={ 0.5 }
        type={ type }
        colorThemeType="light"
    />);
    expect(result).toMatchSnapshot();
}

test("renders linear", () => {
    testGauge('linear');
});
