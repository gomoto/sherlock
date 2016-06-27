// Original source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/93ca28cc11062e4aeba9ce8c5fccea490e57f919/pouchDB/pouch.d.ts

interface PouchPromise {
	then(callback: (response: any) => void): PouchPromise;
	catch(callback: (error: any) => void): PouchPromise;
}

interface PouchError {
	status: number;
	error: string;
	reason: string;
}

interface PouchApi {
	type(): string;
	id(): string;
	close(callback: () => void): void;
}

interface PouchInfoResponse {
	db_name: string;
	doc_count: number;
	update_seq: string;
}

interface PouchApi {
	info(callback?: (err: PouchError, res: PouchInfoResponse) => void): PouchPromise;
}

interface PouchGetOptions {
	rev?: string;
	revs?: boolean;
	revs_info?: boolean;
	conflicts?: boolean;
	attachments?: boolean;
}

interface PouchGetResponse {
	_id: string;
	_rev: string;
	_attachments: any;
}

interface PouchAllDocsOptions {
	startkey?: string;
	endkey?: string;
	descending?: boolean;
	include_docs?: boolean;
	conflicts?: boolean;
}

interface PouchAllDocsItem {
	id: string;
	key: string;
	value: any;
	doc: any;
}

interface PouchAllDocsResponse {
	total_rows: number;
	rows: PouchAllDocsItem[];
}

interface PouchApi {
	//
	// get == select by id
	//
	get(id: string, opts?: PouchGetOptions, callback?: (err: PouchError, res: PouchGetResponse) => void): PouchPromise;
	get(id: string, callback?: (err: PouchError, res?: PouchGetResponse) => void): PouchPromise;
	allDocs(opts?: PouchAllDocsOptions, callback?: (err: PouchError, res: PouchAllDocsResponse) => void): PouchPromise;
	allDocs(callback?: (err: PouchError, res: PouchAllDocsResponse) => void): PouchPromise;
}

interface PouchUpdateOptions {
	new_edits?: boolean;
}

interface PouchUpdateResponse {
	ok: boolean;
	id: string;
	rev: string;
}

interface PouchUpdateError {
	status: number;
	name: string;
	message: string;
	error: boolean;
}

interface PouchApi {
	bulkDocs(req: any[], opts?: PouchUpdateOptions, callback?: (err: PouchError, res?: PouchUpdateResponse[]) => void): PouchPromise;
	bulkDocs(req: any[], callback?: (err: PouchError, res?: PouchUpdateResponse[]) => void): PouchPromise;
	//
	// post == insert (doc does not contain an _id)
	//
	post(doc: any, opts?: PouchUpdateOptions, callback?: (err: PouchError, res: PouchUpdateResponse) => void): PouchPromise;
	post(doc: any, callback?: (err: PouchError, res: PouchUpdateResponse) => void): PouchPromise;
	//
	// put == update (doc DOES contain an _id)
	//
	put(doc: any, opts?: PouchUpdateOptions, callback?: (err: PouchError, res: PouchUpdateResponse) => void): PouchPromise;
	put(doc: any, callback?: (err: PouchError, res: PouchUpdateResponse) => void): PouchPromise;
	//
	// remove == delete
	//
	remove(doc: any, opts?: PouchUpdateOptions, callback?: (err: PouchError, res: PouchUpdateResponse) => void): PouchPromise;
	remove(doc: any, callback?: (err: PouchError, res: PouchUpdateResponse) => void): PouchPromise;
}

interface PouchFilter {
	map: (doc: any) => void;
	reduce?: (key: string, value: any) => any;
}

interface PouchQueryOptions {
	complete?: any;
	include_docs?: boolean;
	error?: (err: PouchError) => void;
	descending?: boolean;
	reduce?: boolean;
}

// If query reduces, only field will be rows.
interface PouchQueryResponse {
	offset?: number;
	rows: any[];
	total_rows?: number;
}

// If query reduces, there will not be an id field.
interface PouchQueryRow {
	id?: string;
	key: string;
	value: any;
}

interface PouchApi {
	//
	// query == select by other criteria
	//
	query(fun: string, opts: PouchQueryOptions, callback: (err: PouchError, res: PouchQueryResponse) => void): void;
	query(fun: string, callback: (err: PouchError, res: PouchQueryResponse) => void): void;
	query(fun: PouchFilter, opts: PouchQueryOptions, callback: (err: PouchError, res: PouchQueryResponse) => void): void;
	query(fun: PouchFilter, callback: (err: PouchError, res: PouchQueryResponse) => void): void;
}

interface PouchAttachmentOptions {
	decode?: boolean;
}

interface PouchApi {
	getAttachment(id: string, opts: PouchAttachmentOptions, callback: (err: PouchError, res: any) => void): void;
	getAttachment(id: string, callback: (err: PouchError, res: any) => void): void;
	putAttachment(id: string, rev: string, doc: any, type: string, callback: (err: PouchError, res: PouchUpdateResponse) => void): void;
	removeAttachment(id: string, rev: string, callback: (err: PouchError, res: PouchUpdateResponse) => void): void;
}

interface PouchCancellable {
	cancel: () => void;
	on: (event: string, callback: (x: any) => void) => PouchCancellable
}

interface PouchChangesOptions {
	onChange: (change: PouchChange) => void;
	complete?: (err: PouchError, res: PouchChanges) => void;
	seq?: number;
	since?: number;
	descending?: boolean;
	filter?: PouchFilter;
	continuous?: boolean;
	include_docs?: boolean;
	conflicts?: boolean;
}

interface PouchChange {
	changes: any;
	doc: PouchGetResponse;
	id: string;
	seq: number;
}

interface PouchChanges {
	results: PouchChange[];
}

interface PouchApi {
	changes(opts: PouchChangesOptions, callback: (err: PouchError, res: PouchChanges) => void): PouchCancellable;
	changes(callback: (err: PouchError, res: PouchChanges) => void): PouchCancellable;
}

interface PouchRevsDiffOptions {
}

interface PouchReplicateOptions {
	continuous?: boolean;
	onChange?: (e: any) => void;
	filter?: any;			// Can be either string or PouchFilter
	live?: boolean;
	retry?: boolean;
	complete?: (err: PouchError, res: PouchChanges) => void;
}

interface PouchReplicateResponse {
	ok: boolean;
	start_time: Date;
	end_time: Date;
	docs_read: number;
	docs_written: number;
}

interface PouchReplicate {
	from(url: string, opts: PouchReplicateOptions, callback: (err: PouchError, res: PouchReplicateResponse) => void): PouchCancellable;
	from(url: string, callback: (err: PouchError, res: PouchReplicateResponse) => void): PouchCancellable;
	to(dbName: string, opts: PouchReplicateOptions, callback: (err: PouchError, res: PouchReplicateResponse) => void): PouchCancellable;
	to(dbName: string, callback: (err: PouchError, res: PouchReplicateResponse) => void): PouchCancellable;
}

interface PouchApi {
	revsDiff(req: any, opts: PouchRevsDiffOptions, callback: (missing: any) => void): void;
	revsDiff(req: any, callback: (missing: any) => void): void;
	replicate: PouchReplicate;
	sync(local: PouchDB, remote: PouchDB, options?: PouchReplicateOptions): PouchCancellable;
}

interface PouchOptions {
	name?: string;
	adapter?: string;
	skip_setup?: boolean;
	auth: {
		username: string;
		password: string;
	};
}

interface PouchDB extends PouchApi {
    new (name: string, opts: PouchOptions, callback: (err: PouchError, res: PouchDB) => void): PouchDB;
    new (name: string, callback: (err: PouchError, res: PouchDB) => void): PouchDB;
    new (name: string, opts: PouchOptions): PouchDB;
    new (name: string): PouchDB;
	destroy(name?: string, callback?: (err: PouchError) => void): PouchPromise;
}

declare var PouchDB: PouchDB;

// Support AMD require
declare module 'pouchdb' {
  export = PouchDB;
}

//
// emit is the function that the PouchFilter.map function should call in order to add a particular item to
// a filter view.
//
declare function emit(key: any, value: any): void;
