export function wireEncodeByteArray(bytes: ArrayLike<number>): string {
  let result = '';
  for (let i = 0; i < bytes.length; ++i) {
    result += ('0' + bytes[i].toString(16)).slice(-2);
  }
  return `0x${result}`;
}

export function wireEncodeNumber(
  value: number | bigint,
  padding: number = 0,
): RawQuantity {
  if (value < 0)
    throw new Error(
      `Wire encoded values must be positive.  Received: ${value}`,
    );
  if (typeof value === 'number' && value > 2 ** 52)
    throw new Error(
      `Wire encoded number values cannot be bigger than ${
        2 ** 52
      }.  Received: ${value}`,
    );
  if (typeof value === 'bigint' && value >= 2 ** 256)
    throw new Error(
      `Wire encoded bigint values must be smaller than ${
        2n ** 256n
      }.  Received: ${value}`,
    );
  return `0x${value.toString(16).padStart(padding, '0')}`;
}

export type BlockTag = 'latest' | 'earliest' | 'pending' | bigint;
export function wireEncodeBlockTag(tag: BlockTag): RawBlockTag {
  return typeof tag === 'string' ? tag : wireEncodeNumber(tag);
}

export function wireEncodeOffChainTransaction(
  transaction: IOffChainTransaction,
): RawOffChainTransaction {
  return {
    from: wireEncodeNumber(transaction.from, 40),
    to: transaction.to ? wireEncodeNumber(transaction.to, 40) : null,
    value: wireEncodeNumber(transaction.value),
    data: wireEncodeByteArray(transaction.data),
    ...(transaction.gasLimit === undefined
      ? {}
      : { gas: wireEncodeNumber(transaction.gasLimit) }),
    ...(transaction.gasPrice === undefined
      ? {}
      : { gasPrice: wireEncodeNumber(transaction.gasPrice) }),
  };
}

export function wireEncodeOnChainTransaction(
  transaction: IOnChainTransaction,
): RawOnChainTransaction {
  return {
    ...wireEncodeOffChainTransaction(transaction),
    gas: wireEncodeNumber(transaction.gasLimit),
    gasPrice: wireEncodeNumber(transaction.gasPrice),
    nonce: wireEncodeNumber(transaction.nonce),
  };
}

export type JsonRpcMethod =
  | 'eth_accounts'
  | 'eth_blockNumber'
  | 'eth_call'
  | 'eth_chainId'
  | 'eth_coinbase'
  | 'eth_estimateGas'
  | 'eth_gasPrice'
  | 'eth_getBalance'
  | 'eth_getBlockByHash'
  | 'eth_getBlockByNumber'
  | 'eth_getBlockTransactionCountByHash'
  | 'eth_getBlockTransactionCountByNumber'
  | 'eth_getCode'
  | 'eth_getLogs'
  | 'eth_getProof'
  | 'eth_getStorageAt'
  | 'eth_getTransactionByBlockHashAndIndex'
  | 'eth_getTransactionByBlockNumberAndIndex'
  | 'eth_getTransactionByHash'
  | 'eth_getTransactionCount'
  | 'eth_getTransactionReceipt'
  | 'eth_getUncleByBlockHashAndIndex'
  | 'eth_getUncleByBlockNumberAndIndex'
  | 'eth_getUncleCountByBlockHash'
  | 'eth_getUncleCountByBlockNumber'
  | 'eth_protocolVersion'
  | 'eth_sendRawTransaction'
  | 'eth_sendTransaction'
  | 'eth_sign'
  | 'eth_signTransaction'
  | 'eth_signTypedData'
  | 'eth_syncing';
export interface IJsonRpcRequest<
  TMethod extends JsonRpcMethod,
  TParams extends Array<unknown>,
> {
  readonly jsonrpc: '2.0';
  readonly id: string | number | null;
  readonly method: TMethod;
  readonly params: TParams;
}
export interface IJsonRpcSuccess<TResult> {
  readonly jsonrpc: '2.0';
  readonly id: string | number | null;
  readonly result: TResult;
}
export interface IJsonRpcError {
  readonly jsonrpc: '2.0';
  readonly id: string | number | null;
  readonly error: {
    readonly code: number;
    readonly message: string;
    readonly data?: unknown;
  };
}
export type IJsonRpcResponse<T> = IJsonRpcSuccess<T> | IJsonRpcError;
export function validateJsonRpcResponse<T>(
  response: any,
): response is IJsonRpcResponse<T> {
  if (
    response.jsonrpc !== '2.0' ||
    (typeof response.id !== 'string' &&
      typeof response.id !== 'number' &&
      response.id !== null) ||
    ('result' in response && 'error' in response) ||
    (!('result' in response) && !('error' in response)) ||
    (response.error && typeof response.error.code !== 'number') ||
    (response.error && typeof response.error.message !== 'string')
  )
    throw new Error(
      `Expected JSON-RPC response, received something else.\n${JSON.stringify(
        response,
      )}`,
    );
  return true;
}
export function isJsonRpcSuccess<T>(
  response: IJsonRpcResponse<T>,
): response is IJsonRpcSuccess<T> {
  return (
    !!(response as IJsonRpcSuccess<T>).result &&
    !(response as IJsonRpcError).error
  );
}
export function isJsonRpcError<T>(
  response: IJsonRpcResponse<T>,
): response is IJsonRpcError {
  return (
    !!(response as IJsonRpcError).error &&
    !(response as IJsonRpcSuccess<T>).result
  );
}

export namespace Rpc {
  export namespace Eth {
    export namespace Accounts {
      export interface RawRequest extends IJsonRpcRequest<'eth_accounts', []> {}
      export interface RawResponse extends IJsonRpcSuccess<Array<RawData>> {}
      export class Request {
        public constructor(public readonly id: string | number | null) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_accounts',
          params: [],
        });
      }
      export class Response {
        public readonly id: string | number | null;
        public readonly result: Array<bigint>;
        public constructor(raw: RawResponse) {
          this.id = raw.id;
          this.result = raw.result.map((x) => BigInt(x));
        }
      }
    }
    export namespace BlockNumber {
      export interface RawRequest
        extends IJsonRpcRequest<'eth_blockNumber', []> {}
      export interface RawResponse extends IJsonRpcSuccess<RawQuantity> {}
      export class Request {
        public constructor(public readonly id: string | number | null) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_blockNumber',
          params: [],
        });
      }
      export class Response {
        public readonly result: bigint;
        public constructor(raw: RawResponse) {
          this.result = BigInt(raw.result);
        }
      }
    }
    export namespace Call {
      export interface RawRequest
        extends IJsonRpcRequest<
          'eth_call',
          [RawOffChainTransaction, RawBlockTag]
        > {}
      export interface RawResponse extends IJsonRpcSuccess<RawData> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly transaction: IOffChainTransaction,
          public readonly blockTag: BlockTag = 'latest',
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_call',
          params: [
            wireEncodeOffChainTransaction(this.transaction),
            wireEncodeBlockTag(this.blockTag),
          ],
        });
      }
      export class Response {
        public readonly result: Bytes;
        public constructor(raw: RawResponse) {
          this.result = Bytes.fromHexString(raw.result);
        }
      }
    }
    export namespace ChainId {
      export interface RawRequest extends IJsonRpcRequest<'eth_chainId', []> {}
      export interface RawResponse
        extends IJsonRpcSuccess<RawQuantity | null> {}
      export class Request {
        public constructor(public readonly id: string | number | null) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_chainId',
          params: [],
        });
      }
      export class Response {
        public readonly result: bigint;
        public constructor(raw: RawResponse) {
          const result = raw.result ? BigInt(raw.result) : null;
          if (result === null) throw new Error(`eth_chainId returned null`);
          this.result = result;
        }
      }
    }
    export namespace Coinbase {
      export interface RawRequest extends IJsonRpcRequest<'eth_coinbase', []> {}
      export interface RawResponse extends IJsonRpcSuccess<RawAddress> {}
      export class Request {
        public constructor(public readonly id: string | number | null) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_coinbase',
          params: [],
        });
      }
      export class Response {
        public readonly result: bigint | null;
        public constructor(raw: RawResponse) {
          this.result = raw !== null ? BigInt(raw.result) : null;
        }
      }
    }
    export namespace EstimateGas {
      export interface RawRequest
        extends IJsonRpcRequest<'eth_estimateGas', [RawOffChainTransaction]> {}
      export interface RawResponse extends IJsonRpcSuccess<RawQuantity> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly transaction: IOffChainTransaction,
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_estimateGas',
          params: [wireEncodeOffChainTransaction(this.transaction)],
        });
      }
      export class Response {
        public readonly result: bigint;
        public constructor(raw: RawResponse) {
          this.result = BigInt(raw.result);
        }
      }
    }
    export namespace GasPrice {
      export interface RawRequest extends IJsonRpcRequest<'eth_gasPrice', []> {}
      export interface RawResponse extends IJsonRpcSuccess<RawQuantity> {}
      export class Request {
        public constructor(public readonly id: string | number | null) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_gasPrice',
          params: [],
        });
      }
      export class Response {
        public readonly result: bigint;
        public constructor(raw: RawResponse) {
          this.result = BigInt(raw.result);
        }
      }
    }
    export namespace GetBalance {
      export interface RawRequest
        extends IJsonRpcRequest<'eth_getBalance', [RawAddress, RawBlockTag]> {}
      export interface RawResponse extends IJsonRpcSuccess<RawQuantity> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly address: bigint,
          public readonly blockTag: BlockTag = 'latest',
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_getBalance',
          params: [
            wireEncodeNumber(this.address, 40),
            wireEncodeBlockTag(this.blockTag),
          ],
        });
      }
      export class Response {
        public readonly result: bigint;
        public constructor(raw: RawResponse) {
          this.result = BigInt(raw.result);
        }
      }
    }
    export namespace GetBlockByHash {
      export interface RawRequest
        extends IJsonRpcRequest<'eth_getBlockByHash', [RawHash, boolean]> {}
      export interface RawResponse extends IJsonRpcSuccess<RawBlock | null> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly hash: bigint,
          public readonly fullTransactions: boolean = false,
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_getBlockByHash',
          params: [wireEncodeNumber(this.hash, 64), this.fullTransactions],
        });
      }
      export class Response {
        public readonly result: Block | null;
        public constructor(raw: RawResponse) {
          this.result = raw.result !== null ? new Block(raw.result) : null;
        }
      }
    }
    export namespace GetBlockByNumber {
      export interface RawRequest
        extends IJsonRpcRequest<
          'eth_getBlockByNumber',
          [RawBlockTag, boolean]
        > {}
      export interface RawResponse extends IJsonRpcSuccess<RawBlock | null> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly fullTransactions: boolean = false,
          public readonly blockTag: BlockTag = 'latest',
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_getBlockByNumber',
          params: [wireEncodeBlockTag(this.blockTag), this.fullTransactions],
        });
      }
      export class Response {
        public readonly result: Block | null;
        public constructor(raw: RawResponse) {
          this.result = raw.result !== null ? new Block(raw.result) : null;
        }
      }
    }
    export namespace GetBlockTransactionCountByHash {
      export interface RawRequest
        extends IJsonRpcRequest<
          'eth_getBlockTransactionCountByHash',
          [RawHash]
        > {}
      export interface RawResponse extends IJsonRpcSuccess<RawQuantity> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly blockHash: bigint,
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_getBlockTransactionCountByHash',
          params: [wireEncodeNumber(this.blockHash, 64)],
        });
      }
      export class Response {
        public readonly result: bigint;
        public constructor(raw: RawResponse) {
          this.result = BigInt(raw.result);
        }
      }
    }
    export namespace GetBlockTransactionCountByNumber {
      export interface RawRequest
        extends IJsonRpcRequest<
          'eth_getBlockTransactionCountByNumber',
          [RawBlockTag]
        > {}
      export interface RawResponse extends IJsonRpcSuccess<RawQuantity> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly blockTag: BlockTag = 'latest',
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_getBlockTransactionCountByNumber',
          params: [wireEncodeBlockTag(this.blockTag)],
        });
      }
      export class Response {
        public readonly result: bigint;
        public constructor(raw: RawResponse) {
          this.result = BigInt(raw.result);
        }
      }
    }
    export namespace GetCode {
      export interface RawRequest
        extends IJsonRpcRequest<'eth_getCode', [RawAddress, RawBlockTag]> {}
      export interface RawResponse extends IJsonRpcSuccess<RawData> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly address: bigint,
          public readonly blockTag: BlockTag = 'latest',
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_getCode',
          params: [
            wireEncodeNumber(this.address, 40),
            wireEncodeBlockTag(this.blockTag),
          ],
        });
      }
      export class Response {
        public readonly result: Bytes;
        public constructor(raw: RawResponse) {
          this.result = Bytes.fromHexString(raw.result);
        }
      }
    }
    export namespace GetLogs {
      export interface RawRequest
        extends IJsonRpcRequest<
          'eth_getLogs',
          [
            {
              address: RawAddress | Array<RawAddress>;
              topics: Array<RawHash>;
            } & (
              | { fromBlock: RawBlockTag; toBlock: RawBlockTag }
              | { blockHash: RawHash }
            ),
          ]
        > {}
      export interface RawResponse extends IJsonRpcSuccess<Array<RawLog>> {}
      export class Request {
        public constructor(id: string | number | null, criteria: CriteriaTag);
        public constructor(id: string | number | null, criteria: CriteriaHash);
        public constructor(id: string | number | null, criteria: Criteria);
        public constructor(
          public readonly id: string | number | null,
          public readonly criteria: Criteria,
        ) {}
        public readonly wireEncode = (): RawRequest => {
          const address = Array.isArray(this.criteria.address)
            ? this.criteria.address.map((x) => wireEncodeNumber(x, 40))
            : wireEncodeNumber(this.criteria.address, 40);
          const topics = this.criteria.topics.map((x) =>
            wireEncodeNumber(x, 64),
          );
          const criteriaBlockTarget = this.isCriteriaHash(this.criteria)
            ? { blockHash: wireEncodeNumber(this.criteria.blockHash, 64) }
            : {
                fromBlock: wireEncodeBlockTag(this.criteria.fromBlock),
                toBlock: wireEncodeBlockTag(this.criteria.toBlock),
              };
          const criteria = { address, topics, ...criteriaBlockTarget };
          return {
            jsonrpc: '2.0',
            id: this.id,
            method: 'eth_getLogs',
            params: [criteria],
          };
        };
        private readonly isCriteriaHash = (
          criteria: Criteria,
        ): criteria is CriteriaHash => !!(criteria as any).blockHash;
      }
      export class Response {
        public readonly result: Array<Log>;
        public constructor(raw: RawResponse) {
          this.result = raw.result.map((x) => new Log(x));
        }
      }
      export interface CriteriaBase {
        address: bigint | Array<bigint>;
        topics: Array<bigint>;
      }
      export interface CriteriaHash extends CriteriaBase {
        blockHash: bigint;
      }
      export interface CriteriaTag extends CriteriaBase {
        fromBlock: bigint;
        toBlock: bigint;
      }
      type Criteria = CriteriaHash | CriteriaTag;
    }
    export namespace GetProof {
      export interface RawRequest
        extends IJsonRpcRequest<
          'eth_getProof',
          [RawAddress, Array<RawHash>, RawBlockTag]
        > {}
      export interface RawResponse
        extends IJsonRpcSuccess<RawMerklePatritiaProof> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly address: bigint,
          public readonly storageKeys: readonly bigint[],
          public readonly blockTag: BlockTag = 'latest',
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_getProof',
          params: [
            wireEncodeNumber(this.address, 40),
            this.storageKeys.map((x) => wireEncodeNumber(x, 64)),
            wireEncodeBlockTag(this.blockTag),
          ],
        });
      }
      export class Response {
        public readonly result: MerklePatritiaProof;
        public constructor(raw: RawResponse) {
          this.result = new MerklePatritiaProof(raw.result);
        }
      }
    }
    export namespace GetStorageAt {
      export interface RawRequest
        extends IJsonRpcRequest<
          'eth_getStorageAt',
          [RawAddress, RawQuantity, RawBlockTag]
        > {}
      export interface RawResponse extends IJsonRpcSuccess<RawData> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly address: bigint,
          public readonly index: bigint,
          public readonly blockTag: BlockTag = 'latest',
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_getStorageAt',
          params: [
            wireEncodeNumber(this.address, 40),
            wireEncodeNumber(this.index),
            wireEncodeBlockTag(this.blockTag),
          ],
        });
      }
      export class Response {
        public readonly result: bigint;
        public constructor(raw: RawResponse) {
          this.result = BigInt(raw.result);
        }
      }
    }
    export namespace GetTransactionByBlockHashAndIndex {
      export interface RawRequest
        extends IJsonRpcRequest<
          'eth_getTransactionByBlockHashAndIndex',
          [RawHash, RawQuantity]
        > {}
      export interface RawResponse
        extends IJsonRpcSuccess<RawTransaction | null> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly blockHash: bigint,
          public readonly transactionIndex: bigint,
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_getTransactionByBlockHashAndIndex',
          params: [
            wireEncodeNumber(this.blockHash, 64),
            wireEncodeNumber(this.transactionIndex),
          ],
        });
      }
      export class Response {
        public readonly id: string | number | null;
        public readonly result: Transaction | null;
        public constructor(raw: RawResponse) {
          this.id = raw.id;
          this.result =
            raw.result !== null ? new Transaction(raw.result) : null;
        }
      }
    }
    export namespace GetTransactionByBlockNumberAndIndex {
      export interface RawRequest
        extends IJsonRpcRequest<
          'eth_getTransactionByBlockNumberAndIndex',
          [RawBlockTag, RawQuantity]
        > {}
      export interface RawResponse
        extends IJsonRpcSuccess<RawTransaction | null> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly transactionIndex: bigint,
          public readonly blockTag: BlockTag = 'latest',
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_getTransactionByBlockNumberAndIndex',
          params: [
            wireEncodeBlockTag(this.blockTag),
            wireEncodeNumber(this.transactionIndex),
          ],
        });
      }
      export class Response {
        public readonly id: string | number | null;
        public readonly result: Transaction | null;
        public constructor(raw: RawResponse) {
          this.id = raw.id;
          this.result =
            raw.result !== null ? new Transaction(raw.result) : null;
        }
      }
    }
    export namespace GetTransactionByHash {
      export interface RawRequest
        extends IJsonRpcRequest<'eth_getTransactionByHash', [RawHash]> {}
      export interface RawResponse
        extends IJsonRpcSuccess<RawTransaction | null> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly transactionHash: bigint,
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_getTransactionByHash',
          params: [wireEncodeNumber(this.transactionHash, 64)],
        });
      }
      export class Response {
        public readonly id: string | number | null;
        public readonly result: Transaction | null;
        public constructor(raw: RawResponse) {
          this.id = raw.id;
          this.result =
            raw.result !== null ? new Transaction(raw.result) : null;
        }
      }
    }
    export namespace GetTransactionCount {
      export interface RawRequest
        extends IJsonRpcRequest<
          'eth_getTransactionCount',
          [RawAddress, RawBlockTag]
        > {}
      export interface RawResponse extends IJsonRpcSuccess<RawQuantity> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly address: bigint,
          public readonly blockTag: BlockTag = 'latest',
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_getTransactionCount',
          params: [
            wireEncodeNumber(this.address, 40),
            wireEncodeBlockTag(this.blockTag),
          ],
        });
      }
      export class Response {
        public readonly id: string | number | null;
        public readonly result: bigint;
        public constructor(raw: RawResponse) {
          this.id = raw.id;
          this.result = BigInt(raw.result);
        }
      }
    }
    export namespace GetTransactionReceipt {
      export interface RawRequest
        extends IJsonRpcRequest<'eth_getTransactionReceipt', [RawHash]> {}
      export interface RawResponse
        extends IJsonRpcSuccess<RawTransactionReceipt | null> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly transactionHash: bigint,
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_getTransactionReceipt',
          params: [wireEncodeNumber(this.transactionHash, 64)],
        });
      }
      export class Response {
        public readonly id: string | number | null;
        public readonly result: TransactionReceipt | null;
        public constructor(raw: RawResponse) {
          this.id = raw.id;
          this.result =
            raw.result !== null ? new TransactionReceipt(raw.result) : null;
        }
      }
    }
    export namespace GetUncleByBlockHashAndIndex {
      export interface RawRequest
        extends IJsonRpcRequest<
          'eth_getUncleByBlockHashAndIndex',
          [RawHash, RawQuantity]
        > {}
      export interface RawResponse extends IJsonRpcSuccess<RawBlock> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly blockHash: bigint,
          public readonly uncleIndex: bigint,
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_getUncleByBlockHashAndIndex',
          params: [
            wireEncodeNumber(this.blockHash, 64),
            wireEncodeNumber(this.uncleIndex),
          ],
        });
      }
      export class Response {
        public readonly id: string | number | null;
        public readonly result: Block | null;
        public constructor(raw: RawResponse) {
          this.id = raw.id;
          this.result = raw.result !== null ? new Block(raw.result) : null;
        }
      }
    }
    export namespace GetUncleByBlockNumberAndIndex {
      export interface RawRequest
        extends IJsonRpcRequest<
          'eth_getUncleByBlockNumberAndIndex',
          [RawBlockTag, RawQuantity]
        > {}
      export interface RawResponse extends IJsonRpcSuccess<RawBlock> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly blockTag: BlockTag,
          public readonly uncleIndex: bigint,
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_getUncleByBlockNumberAndIndex',
          params: [
            wireEncodeBlockTag(this.blockTag),
            wireEncodeNumber(this.uncleIndex),
          ],
        });
      }
      export class Response {
        public readonly id: string | number | null;
        public readonly result: Block | null;
        public constructor(raw: RawResponse) {
          this.id = raw.id;
          this.result = raw.result !== null ? new Block(raw.result) : null;
        }
      }
    }
    export namespace GetUncleCountByBlockHash {
      export interface RawRequest
        extends IJsonRpcRequest<'eth_getUncleCountByBlockHash', [RawHash]> {}
      export interface RawResponse extends IJsonRpcSuccess<RawQuantity> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly blockHash: bigint,
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_getUncleCountByBlockHash',
          params: [wireEncodeNumber(this.blockHash, 64)],
        });
      }
      export class Response {
        public readonly id: string | number | null;
        public readonly result: bigint;
        public constructor(raw: RawResponse) {
          this.id = raw.id;
          this.result = BigInt(raw.result);
        }
      }
    }
    export namespace GetUncleCountByBlockNumber {
      export interface RawRequest
        extends IJsonRpcRequest<
          'eth_getUncleCountByBlockNumber',
          [RawBlockTag]
        > {}
      export interface RawResponse extends IJsonRpcSuccess<RawQuantity> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly blockTag: BlockTag,
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_getUncleCountByBlockNumber',
          params: [wireEncodeBlockTag(this.blockTag)],
        });
      }
      export class Response {
        public readonly id: string | number | null;
        public readonly result: bigint;
        public constructor(raw: RawResponse) {
          this.id = raw.id;
          this.result = BigInt(raw.result);
        }
      }
    }
    export namespace ProtocolVersion {
      export interface RawRequest
        extends IJsonRpcRequest<'eth_protocolVersion', []> {}
      export interface RawResponse extends IJsonRpcSuccess<string> {}
      export class Request {
        public constructor(public readonly id: string | number | null) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_protocolVersion',
          params: [],
        });
      }
      export class Response {
        public readonly id: string | number | null;
        public readonly result: string;
        public constructor(raw: RawResponse) {
          this.id = raw.id;
          this.result = raw.result;
        }
      }
    }
    export namespace SendRawTransaction {
      export interface RawRequest
        extends IJsonRpcRequest<'eth_sendRawTransaction', [RawData]> {}
      export interface RawResponse extends IJsonRpcSuccess<RawHash> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly signedTransaction: Uint8Array,
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_sendRawTransaction',
          params: [wireEncodeByteArray(this.signedTransaction)],
        });
      }
      export class Response {
        public readonly id: string | number | null;
        public readonly result: bigint;
        public constructor(raw: RawResponse) {
          this.id = raw.id;
          this.result = BigInt(raw.result);
        }
      }
    }
    export namespace SendTransaction {
      export interface RawRequest
        extends IJsonRpcRequest<
          'eth_sendTransaction',
          [RawOnChainTransaction]
        > {}
      export interface RawResponse extends IJsonRpcSuccess<RawHash> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly transaction: IOnChainTransaction,
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_sendTransaction',
          params: [wireEncodeOnChainTransaction(this.transaction)],
        });
      }
      export class Response {
        public readonly id: string | number | null;
        public readonly result: bigint;
        public constructor(raw: RawResponse) {
          this.id = raw.id;
          this.result = BigInt(raw.result);
        }
      }
    }
    export namespace Sign {
      export interface RawRequest
        extends IJsonRpcRequest<'eth_sign', [RawAddress, RawData]> {}
      export interface RawResponse extends IJsonRpcSuccess<RawHash> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly signerAddress: bigint,
          public readonly data: Uint8Array,
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_sign',
          params: [
            wireEncodeNumber(this.signerAddress, 40),
            wireEncodeByteArray(this.data),
          ],
        });
      }
      export class Response {
        public readonly id: string | number | null;
        public readonly result: Bytes;
        public constructor(raw: RawResponse) {
          this.id = raw.id;
          this.result = Bytes.fromHexString(raw.result);
        }
      }
    }
    export namespace SignTransaction {
      export interface RawRequest
        extends IJsonRpcRequest<
          'eth_signTransaction',
          [RawOnChainTransaction]
        > {}
      export interface RawResponse
        extends IJsonRpcSuccess<{ raw: RawData; tx: RawSignedTransaction }> {}
      export class Request {
        public constructor(
          public readonly id: string | number | null,
          public readonly transaction: IOnChainTransaction,
        ) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_signTransaction',
          params: [wireEncodeOnChainTransaction(this.transaction)],
        });
      }
      export class Response {
        public readonly id: string | number | null;
        public readonly result: {
          decodedTransaction: ISignedTransaction;
          encodedTransaction: Uint8Array;
        };
        public constructor(raw: RawResponse) {
          this.id = raw.id;
          this.result = {
            decodedTransaction: new SignedTransaction(raw.result.tx),
            encodedTransaction: Bytes.fromHexString(raw.result.raw),
          };
        }
      }
    }
    export namespace Syncing {
      export interface RawRequest extends IJsonRpcRequest<'eth_syncing', []> {}
      export interface RawResponse
        extends IJsonRpcSuccess<
          | false
          | {
              readonly currentBlock: RawQuantity;
              readonly highestBlock: RawQuantity;
              readonly startingBlock: RawQuantity;
            }
        > {}
      export class Request {
        public constructor(public readonly id: string | number | null) {}
        public readonly wireEncode = (): RawRequest => ({
          jsonrpc: '2.0',
          id: this.id,
          method: 'eth_syncing',
          params: [],
        });
      }
      export class Response {
        public readonly id: string | number | null;
        public readonly result:
          | false
          | {
              readonly currentBlock: bigint;
              readonly highestBlock: bigint;
              readonly startingBlock: bigint;
            };
        public constructor(raw: RawResponse) {
          this.id = raw.id;
          this.result =
            typeof raw.result === 'boolean'
              ? raw.result
              : {
                  currentBlock: BigInt(raw.result.currentBlock),
                  highestBlock: BigInt(raw.result.highestBlock),
                  startingBlock: BigInt(raw.result.startingBlock),
                };
        }
      }
    }
  }
}

type DropFirst<T extends any[]> = ((...t: T) => void) extends (
  x: any,
  ...u: infer U
) => void
  ? U
  : never;
type ResultType<T extends { readonly result: unknown }> = T extends {
  readonly result: infer R;
}
  ? R
  : never;
type RpcMethod<
  TRequestConstructor extends new (
    id: string | number | null,
    ...args: any[]
  ) => { wireEncode: () => IJsonRpcRequest<JsonRpcMethod, any[]> },
  TResponseConstructor extends new (rawResponse: IJsonRpcSuccess<any>) => {
    readonly result: any;
  },
> = (
  ...args: DropFirst<ConstructorParameters<TRequestConstructor>>
) => Promise<ResultType<InstanceType<TResponseConstructor>>>;
type MakeRequired<T, K extends keyof T> = T & { [Key in K]-?: T[Key] };

export interface JsonRpc {
  readonly sendEth: (
    destination: bigint,
    amount: bigint,
  ) => Promise<TransactionReceipt>;
  readonly deployContract: (
    bytecode: Uint8Array,
    value?: bigint,
  ) => Promise<bigint>;
  readonly onChainContractCall: (
    transaction: MakeRequired<Partial<IOnChainTransaction>, 'to' | 'data'>,
  ) => Promise<TransactionReceipt>;
  readonly offChainContractCall: (
    transaction: MakeRequired<Partial<IOffChainTransaction>, 'to' | 'data'>,
  ) => Promise<Bytes>;
  readonly remoteProcedureCall: <
    TRawRequest extends IJsonRpcRequest<JsonRpcMethod, Array<any>>,
    TRawResponse extends IJsonRpcSuccess<any>,
  >(
    request: TRawRequest,
  ) => Promise<TRawResponse>;

  readonly call: RpcMethod<
    typeof Rpc.Eth.Call.Request,
    typeof Rpc.Eth.Call.Response
  >;
  readonly coinbase: RpcMethod<
    typeof Rpc.Eth.Coinbase.Request,
    typeof Rpc.Eth.Coinbase.Response
  >;
  readonly estimateGas: RpcMethod<
    typeof Rpc.Eth.EstimateGas.Request,
    typeof Rpc.Eth.EstimateGas.Response
  >;
  readonly getAccounts: RpcMethod<
    typeof Rpc.Eth.Accounts.Request,
    typeof Rpc.Eth.Accounts.Response
  >;
  readonly getBalance: RpcMethod<
    typeof Rpc.Eth.GetBalance.Request,
    typeof Rpc.Eth.GetBalance.Response
  >;
  readonly getBlockByHash: RpcMethod<
    typeof Rpc.Eth.GetBlockByHash.Request,
    typeof Rpc.Eth.GetBlockByHash.Response
  >;
  readonly getBlockByNumber: RpcMethod<
    typeof Rpc.Eth.GetBlockByNumber.Request,
    typeof Rpc.Eth.GetBlockByNumber.Response
  >;
  readonly getBlockNumber: RpcMethod<
    typeof Rpc.Eth.BlockNumber.Request,
    typeof Rpc.Eth.BlockNumber.Response
  >;
  readonly getBlockTransactionCountByHash: RpcMethod<
    typeof Rpc.Eth.GetBlockTransactionCountByHash.Request,
    typeof Rpc.Eth.GetBlockTransactionCountByHash.Response
  >;
  readonly getBlockTransactionCountByNumber: RpcMethod<
    typeof Rpc.Eth.GetBlockTransactionCountByNumber.Request,
    typeof Rpc.Eth.GetBlockTransactionCountByNumber.Response
  >;
  readonly getChainId: RpcMethod<
    typeof Rpc.Eth.ChainId.Request,
    typeof Rpc.Eth.ChainId.Response
  >;
  readonly getCode: RpcMethod<
    typeof Rpc.Eth.GetCode.Request,
    typeof Rpc.Eth.GetCode.Response
  >;
  readonly getGasPrice: RpcMethod<
    typeof Rpc.Eth.GasPrice.Request,
    typeof Rpc.Eth.GasPrice.Response
  >;
  readonly getLogs: RpcMethod<
    typeof Rpc.Eth.GetLogs.Request,
    typeof Rpc.Eth.GetLogs.Response
  >;
  readonly getProof: RpcMethod<
    typeof Rpc.Eth.GetProof.Request,
    typeof Rpc.Eth.GetProof.Response
  >;
  readonly getStorageAt: RpcMethod<
    typeof Rpc.Eth.GetStorageAt.Request,
    typeof Rpc.Eth.GetStorageAt.Response
  >;
  readonly getTransactionByBlockHashAndIndex: RpcMethod<
    typeof Rpc.Eth.GetTransactionByBlockHashAndIndex.Request,
    typeof Rpc.Eth.GetTransactionByBlockHashAndIndex.Response
  >;
  readonly getTransactionByBlockNumberAndIndex: RpcMethod<
    typeof Rpc.Eth.GetTransactionByBlockNumberAndIndex.Request,
    typeof Rpc.Eth.GetTransactionByBlockNumberAndIndex.Response
  >;
  readonly getTransactionByHash: RpcMethod<
    typeof Rpc.Eth.GetTransactionByHash.Request,
    typeof Rpc.Eth.GetTransactionByHash.Response
  >;
  readonly getTransactionCount: RpcMethod<
    typeof Rpc.Eth.GetTransactionCount.Request,
    typeof Rpc.Eth.GetTransactionCount.Response
  >;
  readonly getTransactionReceipt: RpcMethod<
    typeof Rpc.Eth.GetTransactionReceipt.Request,
    typeof Rpc.Eth.GetTransactionReceipt.Response
  >;
  readonly getUncleByBlockHashAndIndex: RpcMethod<
    typeof Rpc.Eth.GetUncleByBlockHashAndIndex.Request,
    typeof Rpc.Eth.GetUncleByBlockHashAndIndex.Response
  >;
  readonly getUncleByBlockNumberAndIndex: RpcMethod<
    typeof Rpc.Eth.GetUncleByBlockNumberAndIndex.Request,
    typeof Rpc.Eth.GetUncleByBlockNumberAndIndex.Response
  >;
  readonly getUncleCountByBlockHash: RpcMethod<
    typeof Rpc.Eth.GetUncleCountByBlockHash.Request,
    typeof Rpc.Eth.GetUncleCountByBlockHash.Response
  >;
  readonly getUncleCountByBlockNumber: RpcMethod<
    typeof Rpc.Eth.GetUncleCountByBlockNumber.Request,
    typeof Rpc.Eth.GetUncleCountByBlockNumber.Response
  >;
  readonly getProtocolVersion: RpcMethod<
    typeof Rpc.Eth.ProtocolVersion.Request,
    typeof Rpc.Eth.ProtocolVersion.Response
  >;
  readonly sendRawTransaction: RpcMethod<
    typeof Rpc.Eth.SendRawTransaction.Request,
    typeof Rpc.Eth.SendRawTransaction.Response
  >;
  readonly sendTransaction: RpcMethod<
    typeof Rpc.Eth.SendTransaction.Request,
    typeof Rpc.Eth.SendTransaction.Response
  >;
  readonly signTransaction: RpcMethod<
    typeof Rpc.Eth.SignTransaction.Request,
    typeof Rpc.Eth.SignTransaction.Response
  >;
  readonly sign: RpcMethod<
    typeof Rpc.Eth.Sign.Request,
    typeof Rpc.Eth.Sign.Response
  >;
  readonly syncing: RpcMethod<
    typeof Rpc.Eth.Syncing.Request,
    typeof Rpc.Eth.Syncing.Response
  >;
}

// https://github.com/microsoft/TypeScript/issues/31535
interface TextEncoder {
  /** Returns "utf-8". */
  readonly encoding: string;
  /** Returns the result of running UTF-8's encoder. */
  encode(input?: string): Uint8Array;
}
declare var TextEncoder: { prototype: TextEncoder; new (): TextEncoder };
