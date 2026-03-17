import { useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { html } from 'htm/react'
import { DESIGN_VERSION } from 'pearpass-lib-constants'
import styled from 'styled-components'

const BarInner = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
`

const Brand = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 20px;
  user-select: none;
`

import { PearpassLogo } from '../../svgs/PearpassLogo'

export const TitleBar = () => {
  if (DESIGN_VERSION !== 2) return null
  if (process.platform !== 'darwin') return null

  const { theme } = useTheme()
  const backgroundColor = theme.colors.colorBackground

  return html`
    <div
      id="bar"
      style=${{
        backgroundColor
      }}
    >
      <${BarInner}>
        <${Brand}>
          <${PearpassLogo} />
        <//>
      <//>
    </div>
  `
}
