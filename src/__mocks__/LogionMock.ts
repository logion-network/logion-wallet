import { AccountType, ValidAccountId, LogionNodeApiClass, LegalOfficerCase, Hash } from "@logion/node-api";
import { H256 } from "@logion/node-api/dist/types/interfaces";
import { It, Mock } from "moq.ts";
import type { Text, Compact, u128 } from '@polkadot/types-codec';
import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
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

const locId = new Mock<Compact<u128>>();
api.setup(instance => instance.adapters.toLocId(It.IsAny())).returns(locId.object());

const hash = new Mock<H256>();
api.setup(instance => instance.adapters.toH256(It.IsAny())).returns(hash.object());

export function setupApiMock(setupFunction: (api: Mock<LogionNodeApiClass>) => void) {
    setupFunction(api);
}

export function mockSubmittable(): Mock<SubmittableExtrinsic> {
    return new Mock<SubmittableExtrinsic>();
}

export const CLOSED_IDENTITY_LOC_ID = "85833363768713528858922097642089825569";

export const CLOSED_IDENTITY_LOC: LegalOfficerCase = {
    owner: DEFAULT_LEGAL_OFFICER.address,
    requesterAddress: mockValidPolkadotAccountId("5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW"),
    locType: 'Identity',
    closed: true,
    files: [
        {
            hash: Hash.fromHex("0xf35e4bcbc1b0ce85af90914e04350cce472a2f01f00c0f7f8bc5c7ba04da2bf2"),
            nature: Hash.fromHex("0x636af5586476273b2b9d9fc318e0d1f124f4e9591b7218da4e4e27f6b071cc94"),
            submitter: TEST_WALLET_USER,
            size: 42n,
            acknowledged: true,
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
