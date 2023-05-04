import { AccountType, ValidAccountId, LogionNodeApiClass, LegalOfficerCase } from "@logion/node-api";
import { It, Mock } from "moq.ts";
import type { Text } from '@polkadot/types-codec';
import { TEST_WALLET_USER } from "src/wallet-user/TestData";

export const DEFAULT_LEGAL_OFFICER = mockValidPolkadotAccountId("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"); // Alice
export const ANOTHER_LEGAL_OFFICER = mockValidPolkadotAccountId("5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"); // Bob
export const A_THIRD_LEGAL_OFFICER = mockValidPolkadotAccountId("5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y"); // Charlie

export function mockValidPolkadotAccountId(address: string): ValidAccountId {
    return mockValidAccountId(address, "Polkadot");
}

export function mockValidAccountId(address: string, type: AccountType): ValidAccountId {
    return {
        address,
        type,
        toKey: () => `${type}:${address}`,
    } as ValidAccountId;
}

export const api = new Mock<LogionNodeApiClass>();

api.setup(instance => instance.queries.getValidAccountId).returns((address: string, _type: string) => mockValidPolkadotAccountId(address));

const localPeerId = new Mock<Text>();
localPeerId.setup(instance => instance.toString()).returns("Mock peer ID");
api.setup(instance => instance.polkadot.rpc.system.localPeerId()).returnsAsync(localPeerId.object());

api.setup(instance => instance.polkadot.createType(It.IsAny())).returnsAsync({});

export function setupApiMock(setupFunction: (api: Mock<LogionNodeApiClass>) => void) {
    setupFunction(api);
}

export const CLOSED_IDENTITY_LOC_ID = "85833363768713528858922097642089825569";

export const UNPREFIXED_FILE_HASH = "42";

export const CLOSED_IDENTITY_LOC: LegalOfficerCase = {
    owner: DEFAULT_LEGAL_OFFICER.address,
    requesterAddress: mockValidPolkadotAccountId("5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW"),
    locType: 'Identity',
    closed: true,
    files: [
        {
            hash: "0x" + UNPREFIXED_FILE_HASH,
            nature: "some-nature",
            submitter: TEST_WALLET_USER,
            size: 42n,
        }
    ],
    metadata: [],
    links: [],
    collectionCanUpload: false,
}

export const OPEN_IDENTITY_LOC_ID = "195914524858768213081425411950368569411";

export const OPEN_IDENTITY_LOC: LegalOfficerCase = {
    owner: DEFAULT_LEGAL_OFFICER.address,
    requesterAddress: mockValidPolkadotAccountId("5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW"),
    locType: 'Identity',
    closed: false,
    files: [],
    metadata: [],
    links: [],
    collectionCanUpload: false,
}

export const CLOSED_COLLECTION_LOC_ID = "195914524858768213081425411950368569411";

export const CLOSED_COLLECTION_LOC: LegalOfficerCase = {
    owner: DEFAULT_LEGAL_OFFICER.address,
    requesterAddress: mockValidPolkadotAccountId("5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW"),
    locType: 'Collection',
    closed: true,
    files: [],
    metadata: [],
    links: [],
    collectionCanUpload: false,
}
