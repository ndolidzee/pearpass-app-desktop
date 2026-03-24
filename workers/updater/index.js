import FramedStream from 'framed-stream'
import PearRuntimeUpdater from 'pear-runtime-updater'

const pipe = new FramedStream(Pear.worker.pipe())

const opts = {
  dir: Pear.config.args[0],
  upgrade: Pear.config.args[1],
  version: Pear.config.args[2],
  app: Pear.config.args[3] !== 'undefined' ? Pear.config.args[3] : undefined,
  name: Pear.config.args[4]
}

const updater = new PearRuntimeUpdater(opts)

const events = {
  UPDATING: 'UPDATING',
  UPDATED: 'UPDATED'
}

updater.on('error', (err) => {
  console.error('updater error:', err)
})

updater.on('updating', () => {
  console.log('updating')
  pipe.write(events.UPDATING)
})

updater.on('updated', async () => {
  console.log('updated')
  await updater.applyUpdate()
  pipe.write(events.UPDATED)
})

updater.ready()

Pear.teardown(async () => {
  await updater.close()
})
