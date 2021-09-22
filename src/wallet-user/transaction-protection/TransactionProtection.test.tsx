jest.mock('../../common/CommonContext');

import { shallowRender } from '../../tests';
import TransactionProtection from './TransactionProtection';

test("renders", () => {
    const tree = shallowRender(<TransactionProtection/>);
    expect(tree).toMatchSnapshot();
});
