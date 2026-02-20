import { html } from 'htm/react'
import { MAX_IMPORT_RECORDS } from 'pearpass-lib-constants'
import {
  parse1PasswordData,
  parseBitwardenData,
  parseLastPassData,
  parseNordPassData,
  parsePearPassData,
  parseProtonPassData
} from 'pearpass-lib-data-import'
import { useCreateRecord, decryptExportData } from 'pearpass-lib-vault'

import { ContentContainer, Description, ImportOptionsContainer } from './styles'
import { readFileContent } from './utils/readFileContent'
import { CardSingleSetting } from '../../../components/CardSingleSetting'
import { ImportDataOption } from '../../../components/ImportDataOption'
import { DecryptFilePassword } from '../../../containers/Modal/DecryptFilePassword'
import { useModal } from '../../../context/ModalContext'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { LockIcon } from '../../../lib-react-components'
import { logger } from '../../../utils/logger'

const importOptions = [
  {
    title: '1Password',
    type: '1password',
    accepts: ['.csv'],
    imgSrc: '/assets/images/1password.png'
  },
  {
    title: 'Bitwarden',
    type: 'bitwarden',
    accepts: ['.json', '.csv'],
    imgSrc: '/assets/images/BitWarden.png'
  },
  {
    title: 'LastPass',
    type: 'lastpass',
    accepts: ['.csv'],
    imgSrc: '/assets/images/LastPass.png'
  },
  {
    title: 'NordPass',
    type: 'nordpass',
    accepts: ['.csv'],
    imgSrc: '/assets/images/NordPass.png'
  },
  {
    title: 'Proton Pass',
    type: 'protonpass',
    accepts: ['.csv', '.json'],
    imgSrc: '/assets/images/ProtonPass.png'
  },
  {
    title: 'Encrypted file',
    type: 'encrypted',
    accepts: ['.pearpass'],
    icon: LockIcon
  },
  {
    title: 'Unencrypted file',
    type: 'unencrypted',
    accepts: ['.json', '.csv'],
    imgSrc: '/assets/images/pearpass_logo.png'
  }
]

const isAllowedType = (fileType, accepts) =>
  accepts.some((accept) => {
    if (accept.startsWith('.')) {
      return fileType === accept.slice(1)
    }
    return fileType === accept
  })

export const ImportTab = () => {
  const { t } = useTranslation()
  const { setToast } = useToast()
  const { setModal, closeModal } = useModal()

  const { createRecord } = useCreateRecord()

  const onError = (error) => {
    setToast({
      message: error.message
    })
  }

  const performImport = async (records) => {
    if (records.length === 0) {
      setToast({
        message: t('No records found to import!')
      })
      return
    }

    if (records.length > MAX_IMPORT_RECORDS) {
      setToast({
        message: t(`Too many records. Maximum is ${MAX_IMPORT_RECORDS}.`)
      })
      return
    }

    const BATCH_SIZE = 100
    const totalRecords = records.length

    for (let i = 0; i < totalRecords; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE)
      await Promise.all(batch.map((record) => createRecord(record, onError)))
    }

    setToast({
      message: t('Data imported successfully')
    })
  }

  const handleFileChange = async ({ files, type, accepts }) => {
    const file = files[0]
    if (!file) return

    const fileType = file.name.split('.').pop()
    let result = []

    const fileContent = await readFileContent(file)

    if (!isAllowedType(fileType, accepts)) {
      throw new Error('Invalid file type')
    }

    try {
      switch (type) {
        case '1password':
          result = await parse1PasswordData(fileContent, fileType)
          break
        case 'bitwarden':
          result = await parseBitwardenData(fileContent, fileType)
          break
        case 'lastpass':
          result = await parseLastPassData(fileContent, fileType)
          break
        case 'nordpass':
          result = await parseNordPassData(fileContent, fileType)
          break
        case 'protonpass':
          result = await parseProtonPassData(fileContent, fileType)
          break
        case 'unencrypted':
          result = await parsePearPassData(fileContent, fileType)
          break
        case 'encrypted':
          const encryptedData = JSON.parse(fileContent)

          if (!encryptedData.encrypted) {
            throw new Error('File is not encrypted')
          }

          setModal(
            html`<${DecryptFilePassword}
              onSubmit=${async (password) => {
                try {
                  const decryptedContent = await decryptExportData(
                    encryptedData,
                    password
                  )

                  const parsedRecords = await parsePearPassData(
                    decryptedContent,
                    'json'
                  )

                  await performImport(parsedRecords)

                  closeModal()
                } catch (decryptError) {
                  logger.error(
                    'DecryptFilePassword',
                    'Decryption error:',
                    decryptError
                  )
                  throw decryptError
                }
              }}
            />`,
            { replace: true }
          )

          return

        default:
          throw new Error(
            'Unsupported template type. Please select a valid import option.'
          )
      }

      await performImport(result)
      closeModal()
    } catch (error) {
      logger.error(
        'useGetMultipleFiles',
        'Error reading file:',
        error.message || error
      )
    }
  }

  return html` <${CardSingleSetting} title=${t('Import Vault')}>
    <${ContentContainer}>
      <${Description}>
        ${t(
          "Move your saved items here from another password manager. They'll be added to this vault."
        )}
      <//>

      <${ImportOptionsContainer}>
        ${importOptions.map(
          ({ title, accepts, type, imgSrc, icon }) =>
            html`<${ImportDataOption}
              key=${title}
              title=${title}
              accepts=${accepts}
              imgSrc=${imgSrc}
              icon=${icon}
              onFilesSelected=${(files) => {
                handleFileChange({ files, type, accepts })
              }}
            />`
        )}
      <//>
    <//>
  <//>`
}
