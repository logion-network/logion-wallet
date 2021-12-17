import { shallowRender } from '../tests';

import Dashboard, { ContentPane, FullWidthPane } from './Dashboard';

test("renders Dashboard", () => {
    const result = shallowRender(
        <Dashboard
            menuTop={ [] }
            menuBottom={ [] }
            menuMiddle={ [] }
        >
        </Dashboard>
    );
    expect(result).toMatchSnapshot();
});

test("renders ContentPane", () => {
    const result = shallowRender(
        <ContentPane
            primaryAreaChildren={ null }
            secondaryAreaChildren={ null }
            mainTitle=""
            titleIcon={{ }}
        />
    );
    expect(result).toMatchSnapshot();
});

test("renders FullWidthPane", () => {
    const result = shallowRender(
        <FullWidthPane
            mainTitle=""
            titleIcon={{ }}
        >
        </FullWidthPane>
    );
    expect(result).toMatchSnapshot();
});
