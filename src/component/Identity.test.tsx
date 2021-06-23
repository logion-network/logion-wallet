import Identity from './Identity';
import { render } from '../tests';

import { DEFAULT_IDENTITY } from './TestData';

test("renders", () => {
    const tree = render(<Identity identity={ DEFAULT_IDENTITY } />);
    expect(tree).toMatchSnapshot();
});
