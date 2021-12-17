import { shallowRender } from '../tests';

import Logo from './Logo';

test("renders in light mode", () => {
    const result = shallowRender(
        <Logo
            shadowColor="#000000"
        />
    );
    expect(result).toMatchSnapshot();
});

test("renders in dark mode", () => {
    const result = shallowRender(
        <Logo
            shadowColor="#ffffff"
        />
    );
    expect(result).toMatchSnapshot();
});
