import { ApiPromise } from "@polkadot/api";

export class ChainTime {

    static async now(api: ApiPromise): Promise<ChainTime> {
        const currentBlock = await api!.rpc.chain.getBlock();
        return new ChainTime(api, Date.now(), currentBlock.block.header.number.toBigInt());
    }

    constructor(api: ApiPromise, now: number, currentBlock: bigint) {
        this._api = api;
        this._currentTime = now;
        this._currentBlock = currentBlock;
    }

    private _api: ApiPromise;
    private _currentTime: number;
    private _currentBlock: bigint;

    get currentTime(): number {
        return this._currentTime;
    }

    get currentBlock() {
        return this._currentBlock;
    }

    async atDate(date: Date): Promise<ChainTime> {
        const diffInMs = BigInt(date.getTime() - this._currentTime);
        const expectedBlockTimeInMs = this._api.consts.timestamp.minimumPeriod.toBigInt() * BigInt(2);
        const deltaInBlocks = diffInMs / expectedBlockTimeInMs;
        const atBlock = this._currentBlock + deltaInBlocks;
        return new ChainTime(this._api, date.getTime(), atBlock);
    }

    async atBlock(blockNumber: bigint): Promise<ChainTime> {
        const diffInBlocks = blockNumber - this._currentBlock;
        const expectedBlockTimeInMs = this._api.consts.timestamp.minimumPeriod.toBigInt() * BigInt(2);
        const deltaInMs = diffInBlocks * expectedBlockTimeInMs;
        const atTime = this._currentTime + Number(deltaInMs);
        return new ChainTime(this._api, atTime, blockNumber);
    }
}
