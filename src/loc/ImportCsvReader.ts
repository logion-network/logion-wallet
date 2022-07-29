import csv from "csv-parser";

const fileReaderStream = require("filereader-stream");

export interface CsvItemWitoutFile {
    id: string;
    description: string;
    validationError?: string;
}

export interface CsvItemWithFile extends CsvItemWitoutFile {
    fileName: string;
    fileContentType: string;
    fileSize: string;
    fileHash: string;
}

export type CsvItem = CsvItemWitoutFile | CsvItemWithFile;

const COLUMNS_WITHOUT_FILE = ['ID', 'DESCRIPTION'] as const;
const COLUMNS_WITH_FILE = [ ...COLUMNS_WITHOUT_FILE, 'FILE NAME', 'FILE CONTENT TYPE', 'FILE SIZE', 'FILE HASH'] as const;

type RowWithoutFile = {
    [K in typeof COLUMNS_WITHOUT_FILE[number] | string]: string
}

type RowWithFile = {
    [K in typeof COLUMNS_WITH_FILE[number] | string]: string
}

export enum CsvRowType {
    WithoutFile,
    WithFile,
}

type CsvRow = RowWithoutFile | RowWithFile;

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

                    const item: CsvItem = {
                        id,
                        description,
                        validationError,
                    };

                    if(rowType === CsvRowType.WithFile) {
                        const dataWithFile: RowWithFile = data as RowWithFile;
                        const itemWithFile = item as CsvItemWithFile;
                        itemWithFile.fileName = dataWithFile['FILE NAME'];
                        itemWithFile.fileContentType = dataWithFile['FILE CONTENT TYPE'];
                        itemWithFile.fileSize = dataWithFile['FILE SIZE'];
                        itemWithFile.fileHash = dataWithFile['FILE HASH'];
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
    const keys = Object.keys(data);
    if(keys.length === COLUMNS_WITHOUT_FILE.length) {
        return validateColumnsGivenType(data, COLUMNS_WITHOUT_FILE, CsvRowType.WithoutFile);
    } else if(keys.length === COLUMNS_WITH_FILE.length) {
        return validateColumnsGivenType(data, COLUMNS_WITH_FILE, CsvRowType.WithFile);
    } else {
        return undefined;
    }
}

function validateColumnsGivenType(data: CsvRow, expectedKeys: ReadonlyArray<string>, expectedType: CsvRowType): CsvRowType | undefined {
    const keys = Object.keys(data);
    for(const key of keys) {
        if(!expectedKeys.includes(key as any)) {
            return undefined;
        }
    }
    return expectedType;
}

function isEmpty(data: CsvRow): boolean {
    const keys = Object.keys(data);
    for(const key of keys) {
        if(data[key]) {
            return false;
        }
    }
    return true;
}
