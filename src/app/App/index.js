import { useState, useCallback } from 'react'

import { useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { html } from 'htm/react'
import { DESIGN_VERSION } from 'pearpass-lib-constants'

import { useInactivity } from './hooks/useInactivity'
import { useOnExtensionExit } from './hooks/useOnExtensionExit'
import { useOnExtensionLockOut } from './hooks/useOnExtensionLockOut'
import { useRedirect } from './hooks/useRedirect'
import { TitleBar } from '../../components/TitleBar'
import { usePearUpdate } from '../../hooks/usePearUpdate'
import { useSimulatedLoading } from '../../hooks/useSimulatedLoading'
import { Routes } from '../Routes'
import { ContentFrame, WindowBackground } from './styles'

export const App = () => {
  const { theme } = useTheme()
  usePearUpdate()
  const isSimulatedLoading = useSimulatedLoading()
  const [isLoadingPageComplete, setIsLoadingPageComplete] = useState(false)

  useInactivity()
  const { isLoading: isDataLoading } = useRedirect()

  useOnExtensionExit()
  useOnExtensionLockOut()

  const handleLoadingComplete = useCallback(() => {
    setIsLoadingPageComplete(true)
  }, [])

  const showLoadingPage =
    DESIGN_VERSION === 2
      ? isDataLoading || !isLoadingPageComplete
      : !isSimulatedLoading && (isDataLoading || !isLoadingPageComplete)

  if (DESIGN_VERSION === 2) {
    return html`
      <${WindowBackground} $backgroundColor=${theme.colors.colorBackground}>
        <${TitleBar} />
        <${ContentFrame}
          $backgroundColor=${theme.colors.colorBackground}
          $borderColor=${theme.colors.colorBorderPrimary}
        >
          <${Routes}
            isSplashScreenShown=${false}
            isDataLoading=${showLoadingPage}
            onLoadingComplete=${handleLoadingComplete}
          />
        <//>
      <//>
    `
  }

  return html`
    <${Routes}
      isSplashScreenShown=${isSimulatedLoading}
      isDataLoading=${showLoadingPage}
      onLoadingComplete=${handleLoadingComplete}
    />
  `
}
