import { shallowRender } from '../tests';
import LocStatusCell from './LocStatusCell';

it("renders REVIEW_PENDING", () => {
    const tree = shallowRender(<LocStatusCell
        status="REVIEW_PENDING"
    />);
    expect(tree).toMatchSnapshot();
});

it("renders REVIEW_REJECTED", () => {
    const tree = shallowRender(<LocStatusCell
        status="REVIEW_REJECTED"
    />);
    expect(tree).toMatchSnapshot();
});

it("renders OPEN", () => {
    const tree = shallowRender(<LocStatusCell
        status="OPEN"
    />);
    expect(tree).toMatchSnapshot();
});
