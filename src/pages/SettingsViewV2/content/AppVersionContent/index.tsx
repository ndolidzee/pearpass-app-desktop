import React, { useEffect, useState } from 'react'

import {
  Button,
  Link,
  PageHeader,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  PEARPASS_WEBSITE,
  PRIVACY_POLICY,
  TERMS_OF_USE
} from '@tetherto/pearpass-lib-constants'

import { useToast } from '../../../../context/ToastContext'
import { useTranslation } from '../../../../hooks/useTranslation'
import { logger } from '../../../../utils/logger'
import { createStyles } from './styles'

const TEST_IDS = {
  root: 'settings-app-version',
  fieldVersion: 'settings-app-version-field',
  checkForUpdates: 'settings-app-version-check-for-updates'
} as const

export const AppVersionContent = (): React.ReactElement => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { setToast } = useToast()
  const styles = createStyles(theme.colors)

  const [currentVersion, setCurrentVersion] = useState('')
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    const electronAPI = window.electronAPI
    if (!electronAPI || typeof electronAPI.getConfig !== 'function') {
      return
    }

    electronAPI
      .getConfig()
      .then((cfg) => {
        if (cfg && typeof cfg.version === 'string') {
          setCurrentVersion(cfg.version)
        }
      })
      .catch((error) =>
        logger.error(
          'AppVersionContent',
          'Error getting runtime config:',
          error
        )
      )
  }, [])

  const handleCheckForUpdates = async () => {
    const electronAPI = window.electronAPI
    if (isChecking || !electronAPI?.checkUpdated) {
      return
    }

    try {
      setIsChecking(true)
      const hasUpdate = await electronAPI.checkUpdated()

      setToast({
        message: hasUpdate
          ? t('Update available. Restart the app to apply it.')
          : t('You are on the latest version.')
      })
    } catch (error) {
      logger.error(
        'AppVersionContent',
        'Error checking for updates:',
        error
      )
      setToast({
        message: t('Could not check for updates. Please try again.')
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div data-testid={TEST_IDS.root} style={styles.root}>
      <PageHeader
        as="h1"
        title={t('App Version')}
        subtitle={
          <>
            {t('Here you can find all the info about your app.')}
            <br />
            {t('Check here to see the')}{' '}
            {/* @ts-ignore - plain CSS object */}
            <Link href={TERMS_OF_USE} isExternal style={styles.descriptionLink}>
              {t('Terms of Use')}
            </Link>
            {', '}
            {/* @ts-ignore - plain CSS object */}
            <Link href={PRIVACY_POLICY} isExternal style={styles.descriptionLink}>
              {t('Privacy Statement')}
            </Link>{' '}
            {t('and')}{' '}
            {/* @ts-ignore - plain CSS object */}
            <Link href={PEARPASS_WEBSITE} isExternal style={styles.descriptionLink}>
              {t('visit our website')}
            </Link>
            .
          </>
        }
      />

      <div style={styles.fieldContainer} data-testid={TEST_IDS.fieldVersion}>
        <Text variant="bodyEmphasized" color={theme.colors.colorTextPrimary}>
          {t('App version')}
        </Text>
        <Text variant="body" color={theme.colors.colorPrimary}>
          {currentVersion}
        </Text>
      </div>

      <Button
        variant="primary"
        size="small"
        isLoading={isChecking}
        onClick={handleCheckForUpdates}
        data-testid={TEST_IDS.checkForUpdates}
      >
        {t('Check for updates')}
      </Button>
    </div>
  )
}
