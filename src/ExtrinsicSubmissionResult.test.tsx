import { render } from './tests';

import ExtrinsicSubmissionResult from './ExtrinsicSubmissionResult';

test("No result, no error", () => {
    const tree = render(<ExtrinsicSubmissionResult result={null} error={null} />);
    expect(tree).toMatchSnapshot();
});

test("No result, error", () => {
    const tree = render(<ExtrinsicSubmissionResult result={null} error={"error"} />);
    expect(tree).toMatchSnapshot();
});

test("Non-finalized result, error", () => {
    const tree = render(<ExtrinsicSubmissionResult result={{isFinalized: false}} error={"error"} />);
    expect(tree).toMatchSnapshot();
});

test("Non-finalized result, no error", () => {
    const tree = render(<ExtrinsicSubmissionResult result={{isFinalized: false, status: {type: "type"}}} error={null} />);
    expect(tree).toMatchSnapshot();
});

test("Finalized result, no error", () => {
    const tree = render(<ExtrinsicSubmissionResult result={{isFinalized: true}} error={null} />);
    expect(tree).toMatchSnapshot();
});

test("Finalized result, no error, custom message", () => {
    const tree = render(<ExtrinsicSubmissionResult result={{isFinalized: true}} error={null} successMessage="Success" />);
    expect(tree).toMatchSnapshot();
});

test("No result, error, custom message", () => {
    const tree = render(<ExtrinsicSubmissionResult result={null} error={"error"} errorMessage="Error" />);
    expect(tree).toMatchSnapshot();
});
