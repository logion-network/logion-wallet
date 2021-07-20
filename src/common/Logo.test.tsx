import { shallowRender } from '../tests';

import Logo from './Logo';

test("renders in light mode", () => {
    const result = shallowRender(
        <Logo
            shadowColor="#000000"
            colorThemeType='light'
        />
    );
    expect(result).toMatchSnapshot();
});

test("renders in dark mode", () => {
    const result = shallowRender(
        <Logo
            shadowColor="#ffffff"
            colorThemeType='dark'
        />
    );
    expect(result).toMatchSnapshot();
});
