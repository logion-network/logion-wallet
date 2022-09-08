import LocCreation from "./LocCreation";

jest.mock('../../common/CommonContext');

import { shallowRender } from '../../tests';
import TransactionProtection from './TransactionProtection';

test("renders", () => {
    const tree = shallowRender(<TransactionProtection locType="Transaction"
                                                      titles={ { main: "main", loc: "loc", request: "request" } }
                                                      iconId="loc"
                                                      actions={ <LocCreation locType='Transaction'
                                                                             requestButtonLabel="Request a Transaction Protection" /> } />);
    expect(tree).toMatchSnapshot();
});
