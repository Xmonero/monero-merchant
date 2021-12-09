export default class Qmr {
  private static instance: Qmr
  public static getInstance(): Qmr {
    if (!Qmr.instance) {
      Qmr.instance = new Qmr()
    }
    return Qmr.instance
  }
  public newAddress = async () => {
    return {
      address:
        '4AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      paymentId: 'XXXXXXXXXXXXXXXX',
    }
  }
  public scanPaymentId = async (paymentId: string) => {
    return { confirmed: 0.1234, unconfirmed: 1 }
  }
}
