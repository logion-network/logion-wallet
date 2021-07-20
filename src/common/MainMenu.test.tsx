import { shallowRender } from '../tests';

import MainMenu from './MainMenu';

test("renders", () => {
    const result = shallowRender(
        <MainMenu
            colorThemeType="light"
            items={[
                {
                    id: "item1",
                    text: "Item1",
                    to: "url1",
                    exact: true
                }
            ]}
        />
    );
    expect(result).toMatchSnapshot();
});
