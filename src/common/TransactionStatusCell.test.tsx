import { render } from '../tests';
import { TransactionStatusCell, TransactionStatusCellDetails } from "./TransactionStatusCell";
import { DEFAULT_TRANSACTION, DEFAULT_FAILED_TRANSACTION } from "./TestData";

jest.unmock("@logion/client");
jest.unmock("@logion/node-api");

test('renders status of successful transaction', () => {
    const result = render(<TransactionStatusCell transaction={ DEFAULT_TRANSACTION } />)
    expect(result).toMatchSnapshot();
})
test('renders status of failed transaction', () => {
    const result = render(<TransactionStatusCell transaction={ DEFAULT_FAILED_TRANSACTION } />)
    expect(result).toMatchSnapshot();
})
test('renders status details of successful transaction', () => {
    const result = render(<TransactionStatusCellDetails transaction={ DEFAULT_TRANSACTION } />)
    expect(result).toMatchSnapshot();
})
test('renders status details of failed transaction', () => {
    const result = render(<TransactionStatusCellDetails transaction={ DEFAULT_FAILED_TRANSACTION } />)
    expect(result).toMatchSnapshot();
})
