import { shallowRender } from '../tests';

import MenuIcon from './MenuIcon';

test("renders with icon and background", () => {
    const result = shallowRender(
        <MenuIcon
            icon={{
                id: "iconId"
            }}
            background={{
                from: "#000000",
                to: "#ffffff",
            }}
        />
    );
    expect(result).toMatchSnapshot();
});

test("renders with icon and custom size", () => {
    const result = shallowRender(
        <MenuIcon
            icon={{
                id: "iconId"
            }}
            height='auto'
            width='auto'
        />
    );
    expect(result).toMatchSnapshot();
});
