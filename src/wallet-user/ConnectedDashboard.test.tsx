import { shallowRender } from '../tests';
import ConnectedDashboard from './ConnectedDashboard';

test("renders", () => {
    const tree = shallowRender(<ConnectedDashboard />);
    expect(tree).toMatchSnapshot();
});
