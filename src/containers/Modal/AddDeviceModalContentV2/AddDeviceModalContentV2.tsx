import { useEffect, useState } from 'react'

import { generateQRCodeSVG } from '@tetherto/pear-apps-utils-qr'
import { html } from 'htm/react'
import { useTheme, RingSpinner} from '@tetherto/pearpass-lib-ui-kit'
import { ContentCopy } from '@tetherto/pearpass-lib-ui-kit/icons'
import {
  authoriseCurrentProtectedVault,
  useInvite,
  useVault
} from '@tetherto/pearpass-lib-vault'

import { createStyles } from './AddDeviceModalContentV2.styles'
import { useModal } from '../../../context/ModalContext'
import { useToast } from '../../../context/ToastContext'
import { useAutoLockPreferences } from '../../../hooks/useAutoLockPreferences'
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard.electron'
import { useTranslation } from '../../../hooks/useTranslation'
import { ModalContentV2 } from '../ModalContentV2'
import { VaultPasswordFormModalContent } from '../VaultPasswordFormModalContent'
import { ScanQRExpireTimer } from '../AddDeviceModalContent/ScanQRExpireTimer'

export const AddDeviceModalContentV2 = () => {
  const { t } = useTranslation()
  const { setToast } = useToast()
  const { closeModal } = useModal()
  const { theme } = useTheme()
  const { colors } = theme
  const [qrSvg, setQrSvg] = useState('')
  const [isProtected, setIsProtected] = useState<boolean | null>(null)
  const { data: vaultData, isVaultProtected } = useVault()
  const { createInvite, deleteInvite, data } = useInvite()
  const { setShouldBypassAutoLock } = useAutoLockPreferences()
  const { copyToClipboard, isCopied } = useCopyToClipboard()

  useEffect(() => {
    setShouldBypassAutoLock(true)
    return () => setShouldBypassAutoLock(false)
  }, [setShouldBypassAutoLock])

  useEffect(() => {
    createInvite()

    return () => {
      deleteInvite()
    }
  }, [])

  useEffect(() => {
    if (data?.publicKey) {
      generateQRCodeSVG(data.publicKey, { type: 'svg', margin: 0 }).then(
        (value: string) => setQrSvg(value)
      )
    }
  }, [data])

  useEffect(() => {
    let cancelled = false

    const checkProtection = async () => {
      const result = await isVaultProtected(vaultData?.id)
      if (!cancelled) {
        setIsProtected(result)
      }
    }

    void checkProtection()

    return () => {
      cancelled = true
    }
  }, [vaultData?.id, isVaultProtected])

  const styles = createStyles(colors)

  const handleCopyKey = () => {
    if (data?.publicKey) {
      copyToClipboard(data.publicKey)
    } else {
      setToast({
        message: t('Invite code not found')
      })
    }
  }

  if (isProtected) {
    return html`<${VaultPasswordFormModalContent}
      onSubmit=${async (password: string) => {
        if (await authoriseCurrentProtectedVault(password)) {
          setIsProtected(false)
        }
      }}
      vault=${vaultData}
    />`
  }

  const displayLink = isCopied ? t('Copied!') : (data?.publicKey ?? '')

  return html`
    <${ModalContentV2}
      onClose=${closeModal}
      backgroundColor=${colors.colorSurfacePrimary}
      borderColor=${colors.colorBorderPrimary}
      headerWrapperStyle=${styles.headerRow}
      headerChildren=${html`
        <span style=${styles.title}>${t('Share Personal Vault')}<//>
      `}
      afterHeaderChildren=${html`
        <div role="separator" style=${styles.divider} />
      `}
    >
      <div style=${styles.body}>
        <span style=${styles.sectionLabel}>${t('Access Code')}<//>
        <div style=${styles.accessPanel}>
          <div style=${styles.qrWrap}>
            <div
              style=${styles.qrInner}
              dangerouslySetInnerHTML=${{ __html: qrSvg }}
            />
          </div>
          <div style=${styles.timerRow}>

          <${RingSpinner}/>
          <div style=${styles.timerTextRow}>
          <span style=${styles.timerText}>${t('Code expires in')}</span>
          <${ScanQRExpireTimer} withSuffix=${true} onFinish=${closeModal} />
          </div>
          </div>
          <div role="separator" style=${styles.divider} />
          <div style=${styles.vaultLinkSection}>
            <div style=${styles.vaultLinkTextColumn}>
              <span style=${styles.sectionLabel}>${t('Vault Link')}<//>
              <span
                style=${styles.vaultLinkValue}
                title=${data?.publicKey ?? ''}
              >
                ${displayLink}
              </span>
            </div>
            <button
              type="button"
              style=${styles.copyIconButton}
              aria-label=${t('Copy vault key')}
              data-testid="add-device-v2-copy-link"
              onClick=${handleCopyKey}
            >
              <${ContentCopy}
                width=${24}
                height=${24}
                color=${colors.colorTextPrimary}
                style=${{ display: 'block' }}
              />
            </button>
          </div>
        </div>
      </div>
    <//>
  `
}
