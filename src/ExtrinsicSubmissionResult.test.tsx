import { SignedTransaction } from './logion-chain/Signature';
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
    const tree = render(<ExtrinsicSubmissionResult result={{isInBlock: false} as SignedTransaction} error={"error"} />);
    expect(tree).toMatchSnapshot();
});

test("Non-finalized result, no error", () => {
    const tree = render(<ExtrinsicSubmissionResult result={{isInBlock: false, status: {type: "Ready"}} as SignedTransaction} error={null} />);
    expect(tree).toMatchSnapshot();
});

test("Finalized result, no error", () => {
    const tree = render(<ExtrinsicSubmissionResult result={{isInBlock: true} as SignedTransaction} error={null} />);
    expect(tree).toMatchSnapshot();
});

test("Finalized result, no error, custom message", () => {
    const tree = render(<ExtrinsicSubmissionResult result={{isInBlock: true} as SignedTransaction} error={null} successMessage="Success" />);
    expect(tree).toMatchSnapshot();
});

test("No result, error, custom message", () => {
    const tree = render(<ExtrinsicSubmissionResult result={null} error={"error"} errorMessage="Error" />);
    expect(tree).toMatchSnapshot();
});
