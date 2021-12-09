import { RequestManager, HTTPTransport, Client } from '@open-rpc/client-js'

import config from '../config'

export default class qmr {
  private static instance: Qmr
  public static getInstance(): Qmr {
    if (!Qmr.instance) {
      Qmr.instance = new Qmr()
    }
    return Qmr.instance
  }
  private qmrTransport = new HTTPTransport(
    `http://${config.crypto.host || 'localhost'}:${
      config.crypto.port || '19991'
    }/json_rpc`
  )
  private qmrClient = new Client(new RequestManager([this.qmrTransport]))
  public newAddress = async () => {
    try {
      const addressInfo = await this.qmrClient.request({
        method: 'make_integrated_address',
        params: {},
      })
      return {
        address: addressInfo.integrated_address,
        paymentId: addressInfo.payment_id,
      }
    } catch (err: any) {
      return {
        address: undefined,
        paymentId: undefined,
      }
    }
  }
  public scanPaymentId = async (paymentId: string) => {
    const qmrData = await this.qmrClient.request({
      method: 'get_payments',
      params: {
        payment_id: paymentId,
      },
    })
    let confirmed = 0,
      unconfirmed = 0
    if (qmrData.payments) {
      for (let i = 0; i < qmrData.payments.length; i++) {
        if (
          parseInt(qmrData.payments[i].unlock_time) <=
          Math.max(10 - config.crypto.minConfirmations || 8, 0)
        ) {
          confirmed += parseInt(qmrData.payments[i].amount) / 1000000000
        }
        unconfirmed += parseInt(qmrData.payments[i].amount) / 1000000000
      }
    }
    return { confirmed, unconfirmed }
  }
}
