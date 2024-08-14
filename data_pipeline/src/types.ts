import Papa from 'papaparse';

// DEPENDENCY TYPES

export type PapaParse = {
	parse: <T>(input: string | File, config?: Papa.ParseConfig) => Papa.ParseResult<T>;
	unparse: <T>(data: T[], config?: Papa.UnparseConfig) => string;
}

export type Http = (
	input: RequestInfo,
	init?: RequestInit
)

// Type for a task that can be added to the queue
export type Task<T = any> = () => Promise<T>;

// Interface for PQueue options
export interface PQueueOptions {
	concurrency?: number;
	interval?: number;
	intervalCap?: number;
	carryoverConcurrencyCount?: boolean;
}

// Interface for the PQueue class
export interface IPQueue {
	// Method to add a task to the queue
	add<T>(fn: Task<T>): Promise<T>;

	// Method that returns a promise that resolves when the queue is empty
	onEmpty(): Promise<void>;
}

export interface KnexDb {
	batchInsert: (
		tableName: string,
		data: any[],
		chunkSize?: number
	) => Promise<void>; // or any other appropriate return type based on your usage

	destroy: () => Promise<void>;
}


// APPLICATION TYPES
export type Downloader = {
	start(url: string): Promise<void>;
}

export type Frontier = {
	start(): Promise<void>;
}

export type Attachment = {
	accessible: string,
	alternative_format_contact_email: string,
	attachment_type: string,
	command_paper_number: string,
	content_type: string,
	file_size: number,
	filename: string,
	hoc_paper_number: string,
	id: string,
	isbn: string,
	preview_url: string,
	title: string,
	unique_reference: string,
	unnumbered_command_paper: boolean,
	unnumbered_hoc_paper: boolean,
	url: string,
}

export type Details = {
	attachments: Attachment[],
}

export type Document = {
	analytics_identifier?: string,
	public_updated_at: string,
	api_path: string,
	api_url: string,
	base_path: string,
	content_id: string,
	document_type: string,
	links: object,
	details?: Details,
	locale: string,
	schema_name: string,
	title: string,
	web_url: string,
	withdrawn?: boolean,
}

export type Links = {
	available_translations: Document[],
	documents: Document[],
	government: Document[],
	organisations: Document[],
	original_primary_publishing_organisation: Document[],
	primary_publishing_organisation: Document[],
	suggested_ordered_related_items: Document[],
	taxons: Document[],
}

// TODO: this needs to be filled out correctly
export type ApiResponse = {
	details: Details,
}

export type GovUKData = {
	"Department family": string
	Entity: string
	Date: string
	"Expense type": string
	"Expense area": string
	Supplier: string
	"Transaction number": string
	Amount: string
	Description: string
	"Supplier Postcode": string
}

export type SpendTransaction = {
	buyer_name: string
	supplier_name: string
	amount: number
	transaction_timestamp: string // should be iso format
}

export type DeadLetterTransaction = {
	buyer_name: string
	supplier_name: string
	amount: string
	transaction_timestamp: string // should be iso format
	pipeline_timestamp?: string | null
	error_message: string
}


