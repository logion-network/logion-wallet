import PostalAddress from './PostalAddress';
import { render } from '../tests';

test("Context initially fetches requests", () => {
    const tree = render(<PostalAddress />);
    expect(tree).toMatchSnapshot();
});
