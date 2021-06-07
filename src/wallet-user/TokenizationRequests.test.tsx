import TokenizationRequests from './TokenizationRequests';
import { shallowRender } from '../tests';

test("renders", () => {
    const tree = shallowRender(<TokenizationRequests />);
    expect(tree).toMatchSnapshot();
});