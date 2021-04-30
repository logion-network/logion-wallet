jest.mock('@polkadot/api');

import { apiMock, hashMock, TOTAL_BLOCKS } from '@polkadot/api';
import {
    fetchExtrinsics,
    BlockAggregatingVisitor,
    AggregateChainSpecification,
    aggregateChain,
    WalkChainSpecification,
    BlockVisitor,
    walkChain,
} from './Blocks';
import { Extrinsic } from '@polkadot/types/interfaces';

test("Fetch at most 10 extrinsics", async () => {
    const specification = {
        head: apiMock.mock.head,
        api: apiMock,
        maxResults: 10,
        matcher: () => true
    };
    const result = await fetchExtrinsics(specification);
    expect(result.extrinsics.length).toBe(10);
});

test("Fetch matching extrinsics", async () => {
    const specification = {
        head: apiMock.mock.head,
        api: apiMock,
        maxResults: 10,
        matcher: (extrinsic: any) => extrinsic.method.section === "balances"
    };
    const result = await fetchExtrinsics(specification);
    expect(result.extrinsics.length).toBe(10);
    result.extrinsics.forEach(extrinsic => expect(extrinsic.method.section).toBe("balances"));
});

test("Fetch extrinsics since hash and none", async () => {
    const specification = {
        head: apiMock.mock.head,
        api: apiMock,
        maxResults: 10,
        matcher: (extrinsic: any) => extrinsic.method.section === "timestamp",
        since: {head: hashMock(TOTAL_BLOCKS - 3), extrinsics: []}
    };
    const result = await fetchExtrinsics(specification);
    expect(result.extrinsics.length).toBe(2);
});

test("Fetch extrinsics after hash", async () => {
    const specification = {
        head: apiMock.mock.head,
        api: apiMock,
        maxResults: 10,
        matcher: (extrinsic: any) => extrinsic.method.section === "timestamp",
        after: hashMock(TOTAL_BLOCKS - 3),
    };
    const result = await fetchExtrinsics(specification);
    expect(result.extrinsics.length).toBe(2);
});

test("Fetch extrinsics after date", async () => {
    const afterDate = new Date(new Date().valueOf() - 6000);
    const specification = {
        head: apiMock.mock.head,
        api: apiMock,
        maxResults: 10,
        matcher: (extrinsic: any) => extrinsic.method.section === "timestamp",
        after: afterDate,
    };
    const result = await fetchExtrinsics(specification);
    expect(result.extrinsics.length).toBe(1);
});

test("chain aggregator", async () => {
    const specification: AggregateChainSpecification = {
        head: apiMock.mock.head,
        api: apiMock,
        maxResults: 10,
    };
    const visitor: BlockAggregatingVisitor<number> = {
        stopWalk: block => block.header.number.toNumber() < 998,
        continueWalk: _ => true,
        consumeBlock: (block, blockNumbers) => blockNumbers.push(block.header.number.toNumber()),
    };
    const blockNumbers = await aggregateChain(visitor, specification);
    expect(blockNumbers.length).toBe(2);
    expect(blockNumbers[0]).toBe(999);
    expect(blockNumbers[1]).toBe(998);
});

test("chain walk", async () => {
    const specification: WalkChainSpecification = {
        head: apiMock.mock.head,
        api: apiMock,
    };
    const blockNumbers: number[] = [];
    const visitor: BlockVisitor = {
        stopWalk: block => block.header.number.toNumber() < 998,
        continueWalk: _ => true,
        consumeBlock: block => blockNumbers.push(block.header.number.toNumber()),
    };
    await walkChain(visitor, specification);
    expect(blockNumbers.length).toBe(2);
    expect(blockNumbers[0]).toBe(999);
    expect(blockNumbers[1]).toBe(998);
});
