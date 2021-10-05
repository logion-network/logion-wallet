type LocItemStatus = 'DRAFT' | 'PUBLISHED'

interface LocItem {
    name: string,
    value: string,
    timestamp: string | null,
    type: 'Data' | 'Document',
    submitter: string,
    status: LocItemStatus
}

