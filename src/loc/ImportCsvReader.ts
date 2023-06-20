import csv from "csv-parser";
import { Hash } from "@logion/client";

const fileReaderStream = require("filereader-stream");

export interface CsvItemWithoutFile {
    id: string;
    description: string;
    validationError?: string;
    termsAndConditionsType: string;
    termsAndConditionsParameters: string;
}

export interface CsvItemWithFile extends CsvItemWithoutFile {
    fileName: string;
    fileContentType: string;
    fileSize: string;
    fileHash: Hash;
}

interface CsvItemToken {
    tokenType: string;
    tokenId: string;
}

export interface CsvItemWithFileAndToken extends CsvItemWithFile, CsvItemToken {
    restrictedDelivery: boolean;
}

export interface CsvItemWithToken extends CsvItemWithoutFile, CsvItemToken {
    
}

export type CsvItem = CsvItemWithoutFile | CsvItemWithFile | CsvItemWithFileAndToken | CsvItemWithToken;

const COLUMNS_WITHOUT_FILE = ['ID', 'DESCRIPTION', 'TERMS_AND_CONDITIONS TYPE', 'TERMS_AND_CONDITIONS PARAMETERS'] as const;
const COLUMNS_WITH_FILE = [ ...COLUMNS_WITHOUT_FILE, 'FILE NAME', 'FILE CONTENT TYPE', 'FILE SIZE', 'FILE HASH'] as const;
const TOKEN_COLUMNS = ['TOKEN TYPE', 'TOKEN ID'] as const;
const COLUMNS_WITH_FILE_AND_TOKEN = [ ...COLUMNS_WITH_FILE, 'RESTRICTED', ...TOKEN_COLUMNS] as const;
const COLUMNS_WITH_TOKEN = [ ...COLUMNS_WITHOUT_FILE, ...TOKEN_COLUMNS] as const;

type RowWithoutFile = {
    [K in typeof COLUMNS_WITHOUT_FILE[number]]: string
}

type RowWithFile = {
    [K in typeof COLUMNS_WITH_FILE[number]]: string
}

type RowWithFileAndToken = {
    [K in typeof COLUMNS_WITH_FILE_AND_TOKEN[number]]: string
}

type RowWithToken = {
    [K in typeof COLUMNS_WITH_TOKEN[number]]: string
}

export enum CsvRowType {
    WithoutFile,
    WithFile,
    WithFileAndToken,
    WithToken,
}

const CSV_ROW_TYPE_VALUES = [ CsvRowType.WithoutFile, CsvRowType.WithFile, CsvRowType.WithFileAndToken, CsvRowType.WithToken ];

const columsByType: Record<CsvRowType, readonly string[]> = {
    [CsvRowType.WithoutFile]: COLUMNS_WITHOUT_FILE,
    [CsvRowType.WithFile]: COLUMNS_WITH_FILE,
    [CsvRowType.WithFileAndToken]: COLUMNS_WITH_FILE_AND_TOKEN,
    [CsvRowType.WithToken]: COLUMNS_WITH_TOKEN,
};

type CsvRow = RowWithoutFile | RowWithFile | RowWithFileAndToken | RowWithToken;

export interface SuccessfulReadItemsCsv {
    items: CsvItem[];
    rowType: CsvRowType;
}

export interface FailedReadItemsCsv {
    error: string;
}

export type ReadItemsCsvResult = SuccessfulReadItemsCsv | FailedReadItemsCsv;

export async function readItemsCsv(file: File): Promise<ReadItemsCsvResult> {
    return new Promise<ReadItemsCsvResult>((resolve, reject) => {
        const rows: CsvItem[] = [];
        const ids: Record<string, null> = {};
        let rowType: CsvRowType | undefined;
        const stream = fileReaderStream(file)
            .pipe(csv())
            .on("data", (data: CsvRow) => {
                if(rowType === undefined) {
                    rowType = validateColumns(data);
                    if(rowType === undefined) {
                        stream.destroy();
                        resolve({ error: "Unexpected schema, check number of column and/or headers" });
                    }
                }
                if(!isEmpty(data)) {
                    const id = data['ID'];
                    const description = data['DESCRIPTION'];
                    let validationError: string | undefined = undefined;
                    if(id in ids) {
                        validationError = "Duplicate ID";
                    }
                    const termsAndConditionsType = data['TERMS_AND_CONDITIONS TYPE'];
                    const termsAndConditionsParameters = data['TERMS_AND_CONDITIONS PARAMETERS'];

                    const item: CsvItem = {
                        id,
                        description,
                        termsAndConditionsType,
                        termsAndConditionsParameters,
                        validationError,
                    };

                    if(rowType === CsvRowType.WithFile || rowType === CsvRowType.WithFileAndToken) {
                        const dataWithFile: RowWithFile = data as RowWithFile;
                        const itemWithFile = item as CsvItemWithFile;
                        itemWithFile.fileName = dataWithFile['FILE NAME'];
                        itemWithFile.fileContentType = dataWithFile['FILE CONTENT TYPE'];
                        itemWithFile.fileSize = dataWithFile['FILE SIZE'];
                        itemWithFile.fileHash = dataWithFile['FILE HASH'] as Hash;
                    }

                    if(rowType === CsvRowType.WithFileAndToken || rowType === CsvRowType.WithToken) {
                        const dataWithToken: RowWithToken = data as RowWithToken;
                        const itemWithToken = item as CsvItemWithToken;
                        itemWithToken.tokenType = dataWithToken['TOKEN TYPE'];
                        itemWithToken.tokenId = dataWithToken['TOKEN ID'];
                    }

                    if(rowType === CsvRowType.WithFileAndToken) {
                        const dataWithToken: RowWithFileAndToken = data as RowWithFileAndToken;
                        const itemWithToken = item as CsvItemWithFileAndToken;
                        itemWithToken.restrictedDelivery = isTrue(dataWithToken['RESTRICTED']);
                    }

                    rows.push(item);

                    ids[id] = null;
                }
            })
            .on("error", (error: any) => reject(error))
            .on("end", () => {
                if(rowType !== undefined) {
                    resolve({
                        items: rows,
                        rowType
                    });
                } else {
                    resolve({ error: "Given file is empty" });
                }
            });
    });
}

function validateColumns(data: CsvRow): CsvRowType | undefined {
    let detectedType: CsvRowType | undefined;
    let detectedTypeColumns = 0;
    for(const rowType of CSV_ROW_TYPE_VALUES) {
        const columns = columsByType[rowType];
        const candidateType = validateColumnsGivenType(data, columns, rowType);
        if(candidateType !== undefined && columns.length > detectedTypeColumns) {
            detectedType = candidateType;
            detectedTypeColumns = columns.length;
        }
    }
    return detectedType;
}

function validateColumnsGivenType(data: CsvRow, expectedKeys: ReadonlyArray<string>, expectedType: CsvRowType): CsvRowType | undefined {
    const keys = Object.keys(data);
    for(const key of expectedKeys) {
        if(!keys.includes(key)) {
            return undefined;
        }
    }
    return expectedType;
}

function isEmpty(data: any): boolean {
    const keys = Object.keys(data);
    for(const key of keys) {
        if(data[key]) {
            return false;
        }
    }
    return true;
}

function isTrue(value: string): boolean {
    return value.toLowerCase() === "y";
}
