import PostalAddress from './PostalAddress';
import { render } from '../tests';

import { DEFAULT_ADDRESS } from './TestData';

test("renders", () => {
    const tree = render(<PostalAddress address={ DEFAULT_ADDRESS } />);
    expect(tree).toMatchSnapshot();
});
