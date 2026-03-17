import { DESIGN_VERSION } from 'pearpass-lib-constants'
import styled from 'styled-components'

export const CategoriesContainer = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  justify-content: space-between;
  row-gap: ${({ size }) => (size === 'default' ? '8px' : '10px')};
  column-gap: 12px;
  ${DESIGN_VERSION === 2 && 'flex-shrink: 0;'}
`
