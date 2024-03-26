import { shallowRender } from '../tests';

import Gauge from './Gauge';

describe("Gauge", () => {

    it("renders", () => {
        const result = shallowRender(<Gauge
            readingIntegerPart={ "99" }
            readingDecimalPart={ "00" }
            unit={ "mLGNT" }
            level={ 0.5 }
        />);
        expect(result).toMatchSnapshot();
    });    
});
