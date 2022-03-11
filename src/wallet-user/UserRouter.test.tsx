jest.mock('../common/CommonContext');

import { shallowRender } from '../tests';
import UserRouter from './UserRouter';

test("renders", () => {
    const tree = shallowRender(<UserRouter />);
    expect(tree).toMatchSnapshot();
});
