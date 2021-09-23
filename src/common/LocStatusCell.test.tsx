import { shallowRender } from '../tests';
import LocStatusCell from './LocStatusCell';

it("renders REQUESTED", () => {
    const tree = shallowRender(<LocStatusCell
        status="REQUESTED"
    />);
    expect(tree).toMatchSnapshot();
});

it("renders REJECTED", () => {
    const tree = shallowRender(<LocStatusCell
        status="REJECTED"
    />);
    expect(tree).toMatchSnapshot();
});

it("renders OPEN", () => {
    const tree = shallowRender(<LocStatusCell
        status="OPEN"
    />);
    expect(tree).toMatchSnapshot();
});
