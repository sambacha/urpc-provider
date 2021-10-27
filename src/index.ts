
class RPCRequest {
  _promise: any;
  args: any;
  method: any;
  promise: any;
  rpc: any;
  constructor (rpc: any, method: any, args = []) {
    this.rpc = rpc
    this.method = method
    this.args = args

    this._promise = null
  }

  then (resolve: any, reject: any) {
    if (this.promise == null) this.promise = this.rpc.request(this.method, this.args)
    return this.promise.then(resolve, reject)
  }

  catch (reject: any) {
    if (this.promise == null) this.promise = this.rpc.request(this.method, this.args)
    return this.promise.catch(reject)
  }

  finally (cb: any) {
    if (this.promise == null) this.promise = this.rpc.request(this.method, this.args)
    return this.promise.finally(cb)
  }
}

module.exports = class ETH {
  rpc: any;
  constructor (rpc: any) {
    this.rpc = rpc
  }

  subscribe (req: any, cb: any) {
    return req.rpc.subscribe(req.method, req.args, cb)
  }

  accounts () {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_accounts', [])
  }

  blockNumber () {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_blockNumber', [])
  }

  call (obj: any, from: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_call', from ? [obj, from] : [obj])
  }

  chainId () {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_chainId', [])
  }

  coinbase () {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_coinbase', [])
  }

  estimateGas (obj: any, from: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_estimateGas', from ? [obj, from] : [obj])
  }

  gasPrice () {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_gasPrice', [])
  }

  getBalance (obj: any, from: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getBalance', from ? [obj, from] : [obj])
  }

  getBlockByHash (hash: any, tx: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getBlockByHash', [hash, tx || false])
  }

  getBlockByNumber (n: any, tx: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getBlockByNumber', [n, tx || false])
  }

  getBlockTransactionCountByHash (hash: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getBlockTransactionCountByHash', [hash])
  }

  getBlockTransactionCountByNumber (n: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getBlockTransactionCountByNumber', [n])
  }

  getCode (addr: any, from: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getCode', from ? [addr, from] : [addr])
  }

  getFilterChanges (id: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getFilterChanges', [id])
  }

  getFilterLogs (id: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getFilterLogs', [id])
  }

  getLogs (obj: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getLogs', [obj])
  }

  getStorageAt (addr: any, pos: any, from: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getStorageAt', from ? [addr, pos, from] : [addr, pos])
  }

  getTransactionByBlockHashAndIndex (hash: any, pos: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getTransactionByBlockHashAndIndex', [hash, pos])
  }

  getTransactionByBlockNumberAndIndex (hash: any, pos: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getTransactionByBlockNumberAndIndex', [hash, pos])
  }

  getTransactionByHash (hash: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getTransactionByHash', [hash])
  }

  getTransactionCount (addr: any, from: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getTransactionCount', from ? [addr, from] : [addr])
  }

  getTransactionReceipt (hash: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getTransactionReceipt', [hash])
  }

  getUncleByBlockHashAndIndex (hash: any, pos: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getUncleByBlockHashAndIndex', [hash, pos])
  }

  getUncleByBlockNumberAndIndex (n: any, pos: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getUncleByBlockNumberAndIndex', [n, pos])
  }

  getUncleCountByBlockHash (hash: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getUncleCountByBlockHash', [hash])
  }

  getUncleCountByBlockNumber (hash: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getUncleCountByBlockNumber', [hash])
  }

  getWork () {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_getWork', [])
  }

  hashrate () {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_hashrate', [])
  }

  mining () {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_mining', [])
  }

  newBlockFilter () {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_newBlockFilter', [])
  }

  newFilter (obj: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_newFilter', [obj])
  }

  newPendingTransactionFilter () {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_newPendingTransactionFilter', [])
  }

  protocolVersion () {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_protocolVersion', [])
  }

  sendRawTransaction (data: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_sendRawTransaction', [data])
  }

  sendTransaction (data: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_sendTransaction', [data])
  }

  sign (addr: any, data: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_sign', [addr, data])
  }

  signTransaction (obj: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_signTransaction', [obj])
  }

  submitHashrate (a: any, b: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_submitHashrate', [a, b])
  }

  submitWork (a: any, b: any, c: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_submitWork', [a, b, c])
  }

  syncing () {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_syncing', [])
  }

  uninstallFilter (id: any) {
    // @ts-expect-error 2554
    return new Request(this.rpc, 'eth_uninstallFilter', [id])
  }

  end () {
    return this.rpc.end ? this.rpc.end() : Promise.resolve()
  }

  destroy () {
    if (this.rpc.destroy) this.rpc.destroy()
  }

  get destroyed () {
    return !!this.rpc.destroyed
  }

  static hexToBigInt (s: any) {
    // @ts-expect-error 2554
    return BigInt(s, 16)
  }

  static bigIntToHex (n: any) {
    return '0x' + n.toString(16)
  }

  static hexToNumber (s: any) {
    // @ts-expect-error 2554
    return Number(s, 16)
  }

  static numberToHex (n: any) {
    return '0x' + n.toString(16)
  }
}
