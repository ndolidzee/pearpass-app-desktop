import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'
import { DESIGN_VERSION } from 'pearpass-lib-constants'
import styled from 'styled-components'

export const AppWrapper = styled.div`
  height: 100%;
`

export const WindowBackground = styled.div`
  ${DESIGN_VERSION === 2
    ? `
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  `
    : `
  height: 100%;
  width: 100%;
  `}
  background-color: ${({ $backgroundColor }) =>
    $backgroundColor || 'transparent'};
  display: flex;
  flex-direction: column;
`
export const ContentFrame = styled.div`
  ${DESIGN_VERSION === 2
    ? `
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  margin: ${rawTokens.spacing8}px;
  `
    : `
  flex: 1 1 auto;
  `}
  border-radius: ${DESIGN_VERSION === 2
    ? process.platform === 'darwin'
      ? `${rawTokens.radius8}px ${rawTokens.radius8}px ${rawTokens.radius20}px ${rawTokens.radius20}px`
      : `${rawTokens.radius8}px`
    : '16px'};
  border: ${({ $borderColor }) =>
    DESIGN_VERSION === 2
      ? `1px solid ${$borderColor || 'transparent'}`
      : 'none'};
  overflow: auto;
  background-color: ${({ $backgroundColor }) =>
    $backgroundColor || 'transparent'};
`
