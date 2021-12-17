import { shallowRender } from '../tests';

import MenuItem from './MenuItem';

test("renders", () => {
    const result = shallowRender(
        <MenuItem
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
