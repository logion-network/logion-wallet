import * as Kilt from '@kiltprotocol/sdk-js';
import { DidUri, IAttestation, ICredential } from '@kiltprotocol/sdk-js';

import { Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import type { Extrinsic } from '@polkadot/types/interfaces';
import { waitReady } from "@polkadot/wasm-crypto";
import { u8aToHex } from "@polkadot/util";

export type { DidUri };

export class KiltAdapter {

    private static connected = false;

    constructor() {
        this.keystore = new Kilt.Did.DemoKeystore();

        this.logionIdentityCType = Kilt.CType.fromSchema({
            $schema: 'http://kilt-protocol.org/draft-01/ctype#',
            title: `Logion Identity LOC`,
            properties: {
                requesterAccountId: {
                    type: 'string'
                },
                identityLocId: {
                    type: 'string'
                },
                legalOfficerAccountId: {
                    type: 'string'
                }
            },
            type: 'object'
        });
    }

    private keystore: Kilt.Did.DemoKeystore;

    private logionIdentityCType: Kilt.CType;

    async connect() {
        if(KiltAdapter.connected) {
            throw new Error("Already connected");
        }
        const kiltConfig = { address: "wss://peregrine.kilt.io:443/parachain-public-ws" };
        await Kilt.init(kiltConfig);
        await Kilt.connect();
        KiltAdapter.connected = true;

        await this.initKeystore();

        console.log(`Connected to KILT: ${kiltConfig.address}`);
    }

    private async initKeystore() {
        await waitReady();
        const keyring = new Keyring({ type: 'sr25519' });
        const seeds = [
            KiltAdapter.ATTESTER_DID_SEED,
            KiltAdapter.GERARD2_SEED,
        ];
        this.keypairs = seeds.map(seed => keyring.addFromUri(seed));
        this.registerRootKeys(seeds);
        this.registerAuthenticationKeys(seeds);
    }

    private registerRootKeys(seeds: string[]) {
        seeds.forEach(seed => this.keystore.generateKeypair({ alg: Kilt.SigningAlgorithms.Sr25519, seed }));
    }

    private registerAuthenticationKeys(seeds: string[]) {
        seeds.forEach(seed => this.keystore.generateKeypair({ alg: Kilt.SigningAlgorithms.Sr25519, seed: seed + "//did//0" }));
    }

    static ATTESTER_DID_SEED: string = "you cave rifle luggage master stamp chunk orchard rice settle olympic velvet";

    static ATTESTER_DID: DidUri = "did:kilt:4pvWYQi953KFwPoCo9qaneoBGSCAdWxME9y4BapKaFXiiuWf";

    static ATTESTER_PUBLIC_KEY = "0xde6d33afd51ccad0930918dba6f4a7e6ede43d921fe845e83c5afa4728206302";

    static GERARD2_SEED = "eye lamp net copy result amount label boy suggest fluid clinic grunt";

    private keypairs?: KeyringPair[];

    async disconnect() {
        if(KiltAdapter.connected) {
            await Kilt.disconnect();
            KiltAdapter.connected = false;
        }
    }

    async createCType() {
        this.ensureConnected();

        const did = KiltAdapter.ATTESTER_DID;
        const creatorDid = await this.buildDidFromChain(did);
        const submitterAccount = this.keypairs!.find(keypair => u8aToHex(keypair.publicKey) === KiltAdapter.ATTESTER_PUBLIC_KEY);
        if(!submitterAccount) {
            throw new Error(`Submitter account was not found in keyring`);
        }

        const submitterAccountId = submitterAccount.address;
        const ctypeCreationTx = await this.logionIdentityCType
            .getStoreTx()
            .then((tx) =>
              creatorDid.authorizeExtrinsic(tx as unknown as Extrinsic, this.keystore, submitterAccountId)
        );

        await Kilt.BlockchainUtils.signAndSubmitTx(
            ctypeCreationTx,
            submitterAccount,
            { resolveOn: Kilt.BlockchainUtils.IS_IN_BLOCK }
        );
    }

    private ensureConnected() {
        if(!KiltAdapter.connected) {
            throw new Error("Please connect first");
        }
    }

    private async buildDidFromChain(did: Kilt.DidUri): Promise<Kilt.Did.FullDidDetails> {
        const creatorDid = await Kilt.Did.FullDidDetails.fromChainInfo(did);
        if(!creatorDid) {
            throw new Error(`DID ${did} not found`);
        }
        return creatorDid;
    }

    async requestAttestation(params: {
        requesterAccountId: string,
        identityLocId: string,
        legalOfficerAccountId: string,
        requesterDidUri: DidUri,
    }): Promise<Kilt.IRequestForAttestation> {
        const { requesterAccountId, identityLocId, legalOfficerAccountId, requesterDidUri } = params;
        this.ensureConnected();

        const content = {
            requesterAccountId,
            identityLocId,
            legalOfficerAccountId,
        };

        const claim = Kilt.Claim.fromCTypeAndClaimContents(
            this.logionIdentityCType,
            content,
            requesterDidUri
        );

        const requesterDid = await this.buildDidFromChain(requesterDidUri);
        const request = Kilt.RequestForAttestation.fromClaim(claim)
        return await request.signWithDidKey(
            this.keystore,
            requesterDid,
            requesterDid.authenticationKey.id
        );
    }

    async attestClaim(
        request: Kilt.IRequestForAttestation
    ): Promise<IAttestation> {
        const attesterFullDid = await this.buildDidFromChain(KiltAdapter.ATTESTER_DID);
        const attestation = Kilt.Attestation.fromRequestAndDid(request, attesterFullDid.uri);
        const tx = await attestation.getStoreTx();
        const attesterAccount = this.keypairs!.find(keypair => u8aToHex(keypair.publicKey) === KiltAdapter.ATTESTER_PUBLIC_KEY);
        if(!attesterAccount) {
            throw new Error(`Submitter account was not found in keyring`);
        }

        const extrinsic = await attesterFullDid.authorizeExtrinsic(
            tx as unknown as Extrinsic,
            this.keystore,
            attesterAccount.address
        )

        await Kilt.BlockchainUtils.signAndSubmitTx(extrinsic, attesterAccount, {
            resolveOn: Kilt.BlockchainUtils.IS_FINALIZED
        });

        return attestation;
    }

    async buildCredential(params: {
        requesterDidUri: DidUri,
        request: Kilt.IRequestForAttestation,
        attestation: Kilt.IAttestation,
    }): Promise<ICredential> {
        const { requesterDidUri, request, attestation } = params;
        const credential = Kilt.Credential.fromRequestAndAttestation(
            request,
            attestation
        );

        const requesterDid = await this.buildDidFromChain(requesterDidUri);
        const presentation = await credential.createPresentation({
            signer: this.keystore,
            claimerDid: requesterDid,
            challenge: "ParisDotComm"
        });
        return presentation;
    }
}
