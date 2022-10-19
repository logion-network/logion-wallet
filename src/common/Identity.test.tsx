import { UserIdentity } from '@logion/client';

import Identity from './Identity';
import { render } from '../tests';
import { DEFAULT_IDENTITY, COLOR_THEME } from './TestData';

const DIFFERENT_IDENTITY: UserIdentity = {
    firstName: "John2",
    lastName: "Doe2",
    email: "john.doe@logion.network",
    phoneNumber: "+1234",
};

test("renders without comparison", () => {
    const tree = render(
        <Identity
            identity={ DEFAULT_IDENTITY }
            colors={ COLOR_THEME.dashboard }
            squeeze={ true }
            noComparison={ true }
        />
    );
    expect(tree).toMatchSnapshot();
});

test("renders and compares with same identity", () => {
    const tree = render(
        <Identity
            identity={ DEFAULT_IDENTITY }
            otherIdentity={ DEFAULT_IDENTITY }
            colors={ COLOR_THEME.dashboard }
            squeeze={ true }
            noComparison={ false }
        />
    );
    expect(tree).toMatchSnapshot();
});

test("renders and compares with different identity", () => {
    const tree = render(
        <Identity
            identity={ DEFAULT_IDENTITY }
            otherIdentity={ DIFFERENT_IDENTITY }
            colors={ COLOR_THEME.dashboard }
            squeeze={ true }
            noComparison={ false }
        />
    );
    expect(tree).toMatchSnapshot();
});
