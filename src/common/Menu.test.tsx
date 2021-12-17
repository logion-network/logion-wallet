import { shallowRender } from '../tests';

import Menu from './Menu';

test("renders", () => {
    const result = shallowRender(
        <Menu
            items={[
                {
                    id: "item1",
                    text: "Item1",
                    to: "url1",
                    exact: true
                },
                {
                    id: "item2",
                    text: "Item2",
                    to: "url2",
                    exact: true,
                    icon: {
                        icon: {
                            id: "iconId"
                        }
                    }
                }
            ]}
        />
    );
    expect(result).toMatchSnapshot();
});
