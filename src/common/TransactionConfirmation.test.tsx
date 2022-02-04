import { render } from '../tests';
import TransactionConfirmation, { Status, Props } from "./TransactionConfirmation";

describe("TransactionConfirmation", () => {

    function testRendering(props: Props, expectedStatus: Status) {
        const result = render(<TransactionConfirmation { ...props } />);
        const expectedResult = `
<p>
  ${ expectedStatus }
</p>
`;
        expect(result).toMatchInlineSnapshot(expectedResult);
    }

    it("goes to status TRANSFERRING upon start", () => {
        let cleared: boolean = false;
        const props: Props = {
            children: (state, startTransferringCallback, cancelCallback, successCallback) => {
                if (state === Status.IDLE) {
                    startTransferringCallback();
                }
                return <p>{ state }</p>
            },
            clearFormCallback: () => {
                cleared = true
            }
        }
        testRendering(props, Status.TRANSFERRING)
        expect(cleared).toBe(false)
    });

    it("goes to status EXPECTING_NEW_TRANSACTION upon success", () => {
        let cleared: boolean = false;
        const props: Props = {
            children: (state, startTransferringCallback, cancelCallback, successCallback) => {
                if (state === Status.IDLE) {
                    successCallback();
                }
                return <p>{ state }</p>
            },
            clearFormCallback: () => {
                cleared = true
            }
        }
        testRendering(props, Status.EXPECTING_NEW_TRANSACTION)
        expect(cleared).toBe(true)
    });

    it("goes to status IDLE upon cancel", () => {
        let cleared: boolean = false;
        const props: Props = {
            children: (state, startTransferringCallback, cancelCallback, successCallback) => {
                if (state === Status.WAITING_FOR_NEW_TRANSACTION) {
                    cancelCallback();
                }
                return <p>{ state }</p>
            },
            clearFormCallback: () => {
                cleared = true
            },
            initialStatus: Status.WAITING_FOR_NEW_TRANSACTION
        }
        testRendering(props, Status.IDLE)
        expect(cleared).toBe(true)
    });
})
