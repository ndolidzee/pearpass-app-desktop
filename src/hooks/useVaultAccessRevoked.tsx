import React, { useCallback } from 'react'

import {
  useCreateVault,
  useVault,
  useVaults,
  type Vault
} from '@tetherto/pearpass-lib-vault'

import { useVaultSwitch } from './useVaultSwitch'
import { AccessRemovedModalContent } from '../containers/Modal/AccessRemovedModalContent'
import { useModal } from '../context/ModalContext'
import { useRouter } from '../context/RouterContext'
import { useToast } from '../context/ToastContext'
import { useTranslation } from './useTranslation'
import { getDeviceName } from '../utils/getDeviceName'
import { logger } from '../utils/logger'

/**
 * Receive-side handler for "another device removed me from this vault".
 * Wipes local data and shows the access-removed modal.
 *
 * Currently invoked manually (e.g. via `window.__pearpassTriggerAccessRevoked`
 * for testing); will be wired into the action-bus once it lands.
 */
export const useVaultAccessRevoked = () => {
  const { t } = useTranslation()
  const { setModal } = useModal()
  const { setToast } = useToast()
  const { navigate } = useRouter()
  const { data: vaults } = useVaults()
  const { data: activeVault, deleteVaultLocal, addDevice } = useVault()
  const { switchVault } = useVaultSwitch()
  const { createVault } = useCreateVault()

  const triggerAccessRevoked = useCallback(
    async (vaultId: string, deviceName?: string) => {
      const vault = (vaults ?? []).find((v: Vault) => v.id === vaultId)
      const vaultName = vault?.name ?? vaultId
      const wasActive = activeVault?.id === vaultId

      try {
        await deleteVaultLocal(vaultId)
      } catch (error) {
        logger.error(
          'useVaultAccessRevoked',
          'deleteVaultLocal failed:',
          error
        )
        return
      }

      if (wasActive) {
        const next = (vaults ?? []).find((v: Vault) => v.id !== vaultId)
        if (next) {
          await switchVault(next)
        } else {
          try {
            await createVault({ name: t('Personal') })
            await addDevice(getDeviceName())
            navigate('vault', { recordType: 'all' })
            setToast({
              message: t('A new "Personal" vault was created')
            })
          } catch (error) {
            logger.error(
              'useVaultAccessRevoked',
              'failed to create fallback Personal vault:',
              error
            )
          }
        }
      }

      setModal(
        <AccessRemovedModalContent
          vaultName={vaultName}
          deviceName={deviceName}
        />
      )
    },
    [
      vaults,
      activeVault?.id,
      deleteVaultLocal,
      switchVault,
      createVault,
      addDevice,
      navigate,
      setModal,
      setToast,
      t
    ]
  )

  return { triggerAccessRevoked }
}
