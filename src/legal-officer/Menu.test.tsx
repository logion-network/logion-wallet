import { shallowRender } from '../tests';
import Menu from './Menu';

test("renders", () => {
    const tree = shallowRender(<Menu />);
    expect(tree).toMatchSnapshot();
});
