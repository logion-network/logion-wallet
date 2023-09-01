import { useLogionChain } from '../logion-chain';

import { UserContextProvider } from "./UserContext";
import ContextualizedWallet from './ContextualizedWallet';

export default function Wallet() {
    const { allAccounts } = useLogionChain();

    if(allAccounts === null) {
        return null;
    }

    return (
        <UserContextProvider>
            <ContextualizedWallet />
        </UserContextProvider>
    );
}
