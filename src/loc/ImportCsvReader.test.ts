import { CsvItemWithFile, CsvRowType, readItemsCsv } from "./ImportCsvReader";

const CSV_WITHOUT_FILE = new File([`ID,DESCRIPTION,TERMS_AND_CONDITIONS TYPE,TERMS_AND_CONDITIONS PARAMETERS
1,An NFT ID,TYPE1,PARAM1
2,Another NFT ID,,
`], "items.csv");

const CSV_WITHOUT_FILE_EMPTY_ROWS = new File([`ID,DESCRIPTION,TERMS_AND_CONDITIONS TYPE,TERMS_AND_CONDITIONS PARAMETERS
1,An NFT ID,TYPE2,PARAM2

2,Another NFT ID,,
`], "items.csv");


const CSV_WITHOUT_FILE_WRONG_NO_HEADER = new File([`1,An NFT ID
2,Another NFT ID
`], "items.csv");

const CSV_WITHOUT_FILE_WRONG_BAD_HEADER = new File([`ID,DESCRIPTIONS
1,An NFT ID
2,Another NFT ID
`], "items.csv");

const CSV_WITH_FILE = new File([`ID,DESCRIPTION,FILE NAME,FILE CONTENT TYPE,FILE SIZE,FILE HASH,TERMS_AND_CONDITIONS TYPE,TERMS_AND_CONDITIONS PARAMETERS
programming_music.jpg,Programming Music,programming_music.jpg,image/jpeg,90718,0xa025ca5f086f3b6df1ca96c235c4daff57083bbd4c9320a3013e787849f9fffa,TYPE3,PARAM3
lucas_games_characters.jpg,LucasArts Games Characters,lucas_games_characters.jpg,image/jpeg,91880,0x546b3a31d340681f4c80d84ab317bbd85870e340d3c2feb24d0aceddf6f2fd3,TYPE4,PARAM4
`], "items.csv");

describe("ImportCsvReader", () => {

    it("reads items without file", async () => {
        const result = await readItemsCsv(CSV_WITHOUT_FILE);
        if("items" in result) {
            const items = result.items;
            expect(items.length).toBe(2);
            expect(items[0].id).toBe("1");
            expect(items[0].description).toBe("An NFT ID");
            expect(items[0].termsAndConditionsType).toBe("TYPE1");
            expect(items[0].termsAndConditionsParameters).toBe("PARAM1");
            expect(items[1].id).toBe("2");
            expect(items[1].description).toBe("Another NFT ID");
            expect(items[1].termsAndConditionsType).toBe("");
            expect(items[1].termsAndConditionsParameters).toBe("");
        } else {
            expect(result.error).not.toBeDefined();
        }
    });

    it("reads items without file and empty rows", async () => {
        const result = await readItemsCsv(CSV_WITHOUT_FILE_EMPTY_ROWS);
        if("items" in result) {
            const items = result.items;
            expect(items.length).toBe(2);
        } else {
            expect(result.error).not.toBeDefined();
        }
    });

    it("reads items with file", async () => {
        const result = await readItemsCsv(CSV_WITH_FILE);
        if("items" in result) {
            expect(result.rowType).toBe(CsvRowType.WithFile);
            const items = result.items as CsvItemWithFile[];
            expect(items.length).toBe(2);

            expect(items[0].id).toBe("programming_music.jpg");
            expect(items[0].description).toBe("Programming Music");
            expect(items[0].fileName).toBe("programming_music.jpg");
            expect(items[0].fileContentType).toBe("image/jpeg");
            expect(items[0].fileSize).toBe("90718");
            expect(items[0].fileHash).toBe("0xa025ca5f086f3b6df1ca96c235c4daff57083bbd4c9320a3013e787849f9fffa");
            expect(items[0].termsAndConditionsType).toBe("TYPE3");
            expect(items[0].termsAndConditionsParameters).toBe("PARAM3");

            expect(items[1].id).toBe("lucas_games_characters.jpg");
            expect(items[1].description).toBe("LucasArts Games Characters");
            expect(items[1].fileName).toBe("lucas_games_characters.jpg");
            expect(items[1].fileContentType).toBe("image/jpeg");
            expect(items[1].fileSize).toBe("91880");
            expect(items[1].fileHash).toBe("0x546b3a31d340681f4c80d84ab317bbd85870e340d3c2feb24d0aceddf6f2fd3");
            expect(items[1].termsAndConditionsType).toBe("TYPE4");
            expect(items[1].termsAndConditionsParameters).toBe("PARAM4");
        } else {
            expect(result.error).not.toBeDefined();
        }
    });

    it("detects wrong CSV without header", async () => {
        const result = await readItemsCsv(CSV_WITHOUT_FILE_WRONG_NO_HEADER);
        if("error" in result) {
            expect(result.error).toBe("Unexpected schema, check number of column and/or headers");
        } else {
            expect(true).toBe(false);
        }
    });

    it("detects wrong CSV with bad headers", async () => {
        const result = await readItemsCsv(CSV_WITHOUT_FILE_WRONG_BAD_HEADER);
        if("error" in result) {
            expect(result.error).toBe("Unexpected schema, check number of column and/or headers");
        } else {
            expect(true).toBe(false);
        }
    });
});
