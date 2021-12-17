import { shallowRender } from '../tests';

import Frame from './Frame';

test("renders", () => {
    const result = shallowRender(
        <Frame>
        </Frame>
    );
    expect(result).toMatchSnapshot();
});
