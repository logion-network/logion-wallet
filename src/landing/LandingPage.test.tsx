import { shallowRender } from '../tests';

import LandingPage from './LandingPage';

test("renders install", () => {
    const result = shallowRender(
        <LandingPage activeStep="install"/>
    );
    expect(result).toMatchSnapshot();
});


test("renders create", () => {
    const result = shallowRender(
        <LandingPage activeStep="create"/>
    );
    expect(result).toMatchSnapshot();
});
