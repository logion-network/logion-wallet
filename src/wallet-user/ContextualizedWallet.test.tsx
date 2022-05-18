jest.mock('../logion-chain');
jest.mock('../common/CommonContext');
jest.mock('./UserContext');
jest.unmock('@logion/client');

import { NoProtection } from '@logion/client';

import ContextualizedWallet from './ContextualizedWallet';
import { setContextMock, setCurrentAddress } from '../logion-chain/__mocks__/LogionChainMock';
import { shallowRender, mockAccount } from '../tests';
import { setProtectionState } from './__mocks__/UserContextMock';
import { SharedState } from '@logion/client/dist/SharedClient';
import { Account } from 'src/common/types/Accounts';

describe("ContextualizedWallet", () => {

    const account = mockAccount("address", "Account name") as unknown as Account;

    const noProtection = new NoProtection({

    } as SharedState);

    test('Given disconnected, when rendering, then show disconnected and connect button', () => {
        setContextMock({
            apiState: 'DISCONNECTED',
            injectedAccounts: [
                account
            ]
        });
        setProtectionState(undefined);
    
        const tree = shallowRender(<ContextualizedWallet />);
    
        expect(tree).toMatchSnapshot();
    });
    
    test('Given connected, when rendering, then show account, no connect button and tokenization', () => {
        setContextMock({
            apiState: 'READY',
            injectedAccounts: [
                mockAccount("address", "Account name")
            ],
            connectedNodeMetadata: {
                name: "Node name",
                peerId: "Node peer ID"
            }
        });
        setProtectionState(noProtection);
    
        const tree = shallowRender(<ContextualizedWallet />);
    
        expect(tree).toMatchSnapshot();
    });
    
    test('Given connected and no metadata, when rendering, then show account, no connect button, no node info, tokenization', () => {
        setContextMock({
            apiState: 'READY',
            injectedAccounts: [
                mockAccount("address", "Account name")
            ],
            connectedNodeMetadata: null
        });
        setProtectionState(noProtection);
    
        const tree = shallowRender(<ContextualizedWallet />);
    
        expect(tree).toMatchSnapshot();
    });
    
    test('Given connection error, when rendering, then show account, no button, no node info', () => {
        setContextMock({
            apiState: 'ERROR',
            injectedAccounts: [
                mockAccount("address", "Account name")
            ],
            connectedNodeMetadata: null
        });
        setProtectionState(noProtection);
    
        const tree = shallowRender(<ContextualizedWallet />);
    
        expect(tree).toMatchSnapshot();
    });
    
    test('Given connecting, when rendering, then show account, no button, no node info', () => {
        setContextMock({
            apiState: 'CONNECTING',
            injectedAccounts: [
                account
            ],
            connectedNodeMetadata: null
        });
        setProtectionState(noProtection);
        setCurrentAddress(account);
    
        const tree = shallowRender(<ContextualizedWallet />);
    
        expect(tree).toMatchSnapshot();
    });
    
    test('Given no injected account, when rendering, then nothing displayed', () => {
        setContextMock({
            apiState: 'READY',
            injectedAccounts: null,
            connectedNodeMetadata: null
        });
    
        const tree = shallowRender(<ContextualizedWallet />);
    
        expect(tree).toMatchSnapshot();
    }); 
});
