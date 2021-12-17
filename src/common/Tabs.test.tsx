import { shallowRender } from '../tests';

import Tabs from './Tabs';

test("renders", () => {
    const activeKey = "key1";
    const onSelect = jest.fn();
    const tabs = [
        {
            key: "key1",
            title: "Tab 1",
            render: () => "Content 1"
        },
        {
            key: "key2",
            title: "Tab 2",
            render: () => "Content 2"
        }
    ];
    const result = shallowRender(
        <Tabs
            activeKey={ activeKey }
            onSelect={ onSelect }
            tabs={ tabs }
        />
    );
    expect(result).toMatchSnapshot();
});
