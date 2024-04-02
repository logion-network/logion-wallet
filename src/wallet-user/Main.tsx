import { useLogionChain } from '../logion-chain';

import { UserContextProvider } from "./UserContext";
import UserDashboard from './UserDashboard';

export default function Wallet() {
    const { allAccounts } = useLogionChain();

    if(allAccounts === null) {
        return null;
    }

    return (
        <UserContextProvider>
            <UserDashboard />
        </UserContextProvider>
    );
}
