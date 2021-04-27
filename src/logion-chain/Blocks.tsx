
import { ApiPromise } from '@polkadot/api';
import { Hash, Block, Extrinsic } from '@polkadot/types/interfaces';

type Limit = Date | Hash | undefined | null;

export async function fetchExtrinsics(specification: ExtrinsicFetchSpecification): Promise<ExtrinsicsAndHead> {
    let limit: Limit = getLimit(specification);
    const visitor: BlockAggregatingVisitor<Extrinsic> = {
        stopWalk: block => isLimitReached(block, limit),
        continueWalk: _ => true,
        consumeBlock: (block, extrinsics) => {
            const filteredExtrinsics = block.extrinsics.filter(specification.matcher);
            const maxExpectedExtrinsics = specification.maxResults - extrinsics.length;
            let extractedExtrinsics;
            if(block.extrinsics.length <= maxExpectedExtrinsics) {
                extractedExtrinsics = filteredExtrinsics;
            } else {
                extractedExtrinsics = filteredExtrinsics.slice(-maxExpectedExtrinsics);
            }
            extractedExtrinsics.forEach(extrinsic => extrinsics.push(extrinsic));
        }
    };
    const newExtrinsics = await aggregateChain(visitor, specification);
    const extrinsics = includeNewExtrinsics(newExtrinsics, specification);
    return {extrinsics, head: getHash(specification.head)};
}

export interface ExtrinsicFetchSpecification extends AggregateChainSpecification {
    after?: Date | Hash,
    matcher: (extrinsic: Extrinsic) => boolean,
    since?: ExtrinsicsAndHead | null
}

export interface AggregateChainSpecification extends WalkChainSpecification {
    maxResults: number,
}

export interface WalkChainSpecification {
    head: Hash | Block,
    api: ApiPromise,
}

export interface ExtrinsicsAndHead {
    extrinsics: Extrinsic[],
    head: Hash
}

function getLimit(specification: ExtrinsicFetchSpecification): Limit {
    if(specification.since !== undefined && specification.since !== null) {
        return specification.since.head;
    } else {
        return specification.after;
    }
}

export interface BlockAggregatingVisitor<T> {
    stopWalk: (block: Block) => boolean,
    consumeBlock: (block: Block, results: T[]) => void,
    continueWalk: (block: Block) => boolean,
}

export function isLimitReached(block: Block, limit: Limit): boolean {
    if(limit === undefined || limit === null) {
        return false;
    } else if(limit instanceof Date) {
        if(hasTimestamp(block)) {
            return getTimestamp(block) < limit;
        } else {
            return false;
        }
    } else {
        return hashEquals(block.hash, limit);
    }
}

export function hasTimestamp(block: Block): boolean {
    return block.extrinsics
        .filter(extrinsic => extrinsic.method.section === "timestamp" && extrinsic.method.method === "set").length > 0;
}

export function getTimestamp(block: Block): Date {
    const timestampExtrinsic = block.extrinsics
        .filter(extrinsic => extrinsic.method.section === "timestamp" && extrinsic.method.method === "set")[0];
    const millisecondsSinceEpoch = Number(timestampExtrinsic.method.args.toString());
    return new Date(millisecondsSinceEpoch);
}

export function hashEquals(h1: Hash | null, h2: Hash | null): boolean {
    if(h1 === null && h2 === null) {
        return true;
    } else if(h1 !== null && h2 === null) {
        return false;
    } else if(h1 === null && h2 !== null) {
        return false;
    } else {
        return h1!.toString() === h2!.toString();
    }
}


export async function aggregateChain<T>(visitor: BlockAggregatingVisitor<T>, specification: AggregateChainSpecification): Promise<T[]> {
    const results: T[] = [];
    const walkVisitor: BlockVisitor = {
        stopWalk: block => results.length >= specification.maxResults || visitor.stopWalk(block),
        continueWalk: visitor.continueWalk,
        consumeBlock: block => visitor.consumeBlock(block, results),
    };
    await walkChain(walkVisitor, specification);
    return results;
}

export interface BlockVisitor {
    stopWalk: (block: Block) => boolean,
    consumeBlock: (block: Block) => void,
    continueWalk: (block: Block) => boolean,
}

export async function walkChain(visitor: BlockVisitor, specification: WalkChainSpecification): Promise<void> {
    const head: Block = await getBlock(specification.head, specification.api);
    if(!visitor.stopWalk(head)) {
        visitor.consumeBlock(head);

        if(head.header.number.toNumber() > 0 && visitor.continueWalk(head)) {
            return walkChain(visitor, {...specification, head: head.header.parentHash});
        } else {
            return;
        }
    }
}

async function getBlock(hashOrBlock: Hash | Block, api: ApiPromise): Promise<Block> {
    if(isBlock(hashOrBlock)) {
        return hashOrBlock as Block;
    } else {
        const hash = hashOrBlock as Hash;
        const signedBlock = await api.rpc.chain.getBlock(hash);
        return signedBlock.block;
    }
}

function isBlock(hashOrBlock: Hash | Block): boolean {
    return "extrinsics" in hashOrBlock;
}

function includeNewExtrinsics(newExtrinsics: Extrinsic[], spec: ExtrinsicFetchSpecification): Extrinsic[] {
    if(spec.since === undefined || spec.since ===  null) {
        return newExtrinsics;
    } else {
        const allExtrinsics = spec.since.extrinsics.concat(newExtrinsics);
        if(allExtrinsics.length <= spec.maxResults) {
            return allExtrinsics;
        } else {
            return allExtrinsics.slice(-spec.maxResults);
        }
    }
}

function getHash(hashOrBlock: Hash | Block): Hash {
    if(isBlock(hashOrBlock)) {
        return (hashOrBlock as Block).hash;
    } else {
        return hashOrBlock as Hash;
    }
}
