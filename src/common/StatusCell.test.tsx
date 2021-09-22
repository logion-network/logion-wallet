import { shallowRender } from '../tests';
import StatusCell from './StatusCell';

it("renders with undefined text transform", () => {
    const tree = shallowRender(<StatusCell
        color="red"
        text="Some text"
        icon={{id: "icon-id"}}
    />);
    expect(tree).toMatchSnapshot();
});

it("renders with text transform", () => {
    const tree = shallowRender(<StatusCell
        color="red"
        text="Some text"
        icon={{id: "icon-id"}}
        textTransform="uppercase"
    />);
    expect(tree).toMatchSnapshot();
});
