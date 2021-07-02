import { shallowRender } from './tests';

import LandingPage from './LandingPage';

test("renders", () => {
    const result = shallowRender(
        <LandingPage>
            Test
        </LandingPage>
    );
    expect(result).toMatchSnapshot();
});
