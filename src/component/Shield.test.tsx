import { shallowRender } from '../tests';

import Shield from './Shield';

test("renders", () => {
    const result = shallowRender(
        <Shield
            colorThemeType="light"
            item={{
                id: "item1",
                text: "Item1",
                to: "url1",
                exact: true
            }}
        />
    );
    expect(result).toMatchSnapshot();
});
