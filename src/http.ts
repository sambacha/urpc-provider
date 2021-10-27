// @ts-ignore
import ETH from './index';
import got from 'got';
module.exports = class HTTP extends ETH {
  constructor (endpoint: any) {
    super(new HTTPRPC(endpoint))
  }
}

class HTTPRPC {
  destroyed: any;
  endpoint: any;
  constructor (endpoint: any) {
    this.endpoint = endpoint
    this.destroyed = false
  }

  async request (method: any, params: any) {
    const res = await got.post({
      url: this.endpoint,
      timeout: 5000,
      json: {
        jsonrpc: '2.0',
        method,
        params,
        id: 1
      },
      responseType: 'json'
    })

    if (res.body.error) {
      const error = new Error(res.body.error.message)
      // @ts-expect-error
      error.code = res.body.error.code
      throw error
    }

    return res.body.result
  }

  subscribe () {
    throw new Error('HTTP does not support pubsub')
  }

  destroy () {}
}
