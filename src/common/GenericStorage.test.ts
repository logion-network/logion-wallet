import {
    storeSingle,
    newSingleJsonStorable,
    loadSingle,
    clearSingle,
    newMultiJsonStorable,
    storeMulti, loadMulti, clearMulti
} from "./GenericStorage";

describe("GenericStorage", () => {

    type TestType = {
        x: number,
        name: string,
        nested: {
            y: number,
            description: string
        }
        series: number[];
    }

    const value1: TestType = {
        x: 1,
        name: "Doe",
        nested: {
            description: "something",
            y: 0
        },
        series: [2, 3, 4]
    }

    it("stores, retrieves and clear a single object ", () => {
        const singleStorable = newSingleJsonStorable<TestType>("test-1");
        storeSingle(singleStorable, value1);
        const actual = loadSingle(singleStorable);
        expect(actual).toEqual(value1);
        clearSingle(singleStorable);
        expect(loadSingle(singleStorable)).toBeUndefined();
    })

    it("stores, retrieves and clear a multi object ", () => {
        const multiStorable = newMultiJsonStorable<TestType>("test-1");
        storeMulti(multiStorable, "1", value1);
        let actual: Record<string, TestType> = loadMulti(multiStorable);
        expect(actual["1"]).toEqual(value1);

        const value2: TestType = {
            x: 99,
            name: "Scott",
            nested: {
                description: "Tiger",
                y: 100
            },
            series: [10, 11]
        }

        storeMulti(multiStorable, "2", value2)
        actual = loadMulti(multiStorable);
        expect(actual["1"]).toEqual(value1);
        expect(actual["2"]).toEqual(value2);

        clearMulti(multiStorable);
        actual = loadMulti(multiStorable);
        expect(actual["1"]).toBeUndefined();
        expect(actual["2"]).toBeUndefined();
    })
})
