import roundTo from 'round-to'
import { CronJob } from 'cron'
import { getRepository } from 'typeorm'

import config from '../config'
import Qmr from './qmr'
import QmrMock from './qmr-mock'
import { Invoice } from './orm'

const qmr =
  config.crypto.mock || process.env.NODE_ENV === 'test'
    ? QmrMock.getInstance()
    : Qmr.getInstance()

const scanInvoices = new CronJob('*/30 * * * * *', async () => {
  try {
    const invoices = await getRepository(Invoice)
      .createQueryBuilder()
      .where({ status: 'Pending' })
      .select(['id', 'paymentId', 'amount'])
      .getRawMany()

    await Promise.all(
      invoices.map(async (invoice) => {
        let { confirmed, unconfirmed } = await qmr.scanPaymentId(
          invoice.paymentId
        )
        confirmed = roundTo(confirmed, 8)
        unconfirmed = roundTo(unconfirmed, 8)
        if (confirmed > parseFloat(invoice.amount)) {
          await getRepository(Invoice)
            .createQueryBuilder()
            .update()
            .where({ id: invoice.id })
            .set({ status: 'Received' })
            .execute()
        } else if (unconfirmed > parseFloat(invoice.amount)) {
          await getRepository(Invoice)
            .createQueryBuilder()
            .update()
            .where({ id: invoice.id })
            .set({ status: 'Confirming' })
            .execute()
        }
      })
    )
  } catch (err) {
    console.log(`Error scanning invoices: ${err}`)
  } finally {
    await getRepository(Invoice)
      .createQueryBuilder()
      .update()
      .where(`expiry < DATETIME(CURRENT_TIMESTAMP)`)
      .set({ status: 'Expired' })
      .execute()
  }
})

export { scanInvoices }
