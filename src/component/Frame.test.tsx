import { shallowRender } from '../tests';

import Frame from './Frame';
import { LIGHT_MODE } from '../legal-officer/Types';

test("renders", () => {
    const result = shallowRender(
        <Frame
            colors={ LIGHT_MODE }
        >
        </Frame>
    );
    expect(result).toMatchSnapshot();
});
