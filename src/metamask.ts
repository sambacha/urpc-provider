// @ts-expect-error
import * as ETH from './index';

module.exports = class Metamask extends ETH {
  constructor() {
    super(new ETHRPC());
  }
};

declare const window: any;

declare global {
  interface Window {
    ETHRPC: any;
  }
}
class ETHRPC {
  destroyed: any;
  enable: any;
  constructor() {
    this.enable = window.ethereum.enable();
    this.destroyed = false;
  }

  request(method: any, params: any) {
    return this.enable.then((accounts: any) => {
      return new Promise((resolve, reject) => {
        window.ethereum.sendAsync(
          {
            method,
            params,
            from: accounts[0],
          },
          function (err: any, res: any) {
            if (err) {
              const error = new Error(err.message);
              error.code = err.code;
              return reject(error);
            }
            resolve(res.result);
          },
        );
      });
    });
  }

  subscribe() {
    throw new Error('Metamask does not support pubsub');
  }

  destroy() {}
}
