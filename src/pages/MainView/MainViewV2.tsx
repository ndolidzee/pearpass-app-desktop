import React, { useEffect, useMemo, useState } from 'react'

import { useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { useRecords } from '@tetherto/pearpass-lib-vault'

import { createStyles } from './MainViewV2.styles'
import { BrowserExtensionDialogV2 } from '../../containers/Modal/BrowserExtensionDialogV2'
import { EmptyCollectionViewV2 } from '../../containers/EmptyCollectionViewV2'
import { EmptyResultsViewV2 } from '../../containers/EmptyResultsViewV2'
import { RecordListViewV2 } from '../../containers/RecordListView/RecordListViewV2'
import { useAppHeaderContext } from '../../context/AppHeaderContext'
import { useGlobalLoading } from '../../context/LoadingContext'
import { useModal } from '../../context/ModalContext'
import { useRouter } from '../../context/RouterContext'
import { isNativeMessagingIPCRunning } from '../../services/nativeMessagingIPCServer'
import { getNativeMessagingEnabled } from '../../services/nativeMessagingPreferences'
import { groupRecordsByTimePeriod } from '../../utils/groupRecordsByTimePeriod'
import { isFavorite } from '../../utils/isFavorite'

const SORT_BY_TYPE = {
  recent: { key: 'updatedAt', direction: 'desc' as const },
  newToOld: { key: 'createdAt', direction: 'desc' as const },
  oldToNew: { key: 'createdAt', direction: 'asc' as const }
}

type SortType = keyof typeof SORT_BY_TYPE

export const MainViewV2 = () => {
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { setModal } = useModal()
  const { searchValue } = useAppHeaderContext()
  const { data: routerData } = useRouter()

  const [sortType] = useState<SortType>('recent')
  const [isMultiSelectOn, setIsMultiSelectOn] = useState(false)
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])

  useEffect(() => {
    const enabled = getNativeMessagingEnabled()
    const isRunning = isNativeMessagingIPCRunning()

    if (!enabled || !isRunning) {
      setModal(<BrowserExtensionDialogV2 />)
    }
    // Run once per mount; modal setter is stable per context instance.
  }, [setModal])

  const isFavoritesView = isFavorite(routerData?.folder ?? '')
  const selectedFolder =
    routerData?.folder && !isFavoritesView ? routerData.folder : undefined

  const sort = useMemo(() => SORT_BY_TYPE[sortType], [sortType])

  const { data: records, isLoading } = useRecords({
    shouldSkip: true,
    variables: {
      filters: {
        searchPattern: searchValue,
        type:
          routerData?.recordType === 'all' ? undefined : routerData?.recordType,
        folder: selectedFolder,
        isFavorite: isFavoritesView ? true : undefined
      },
      sort
    }
  })

  useGlobalLoading({ isLoading })

  const sections = useMemo(
    () => groupRecordsByTimePeriod(records ?? [], sort),
    [records, sort]
  )

  useEffect(() => {
    setSelectedRecords([])
    setIsMultiSelectOn(false)
  }, [routerData?.folder, routerData?.recordType, searchValue])

  const hasRecords = !!records?.length
  const hasSearch = !!searchValue.length

  return (
    <div style={styles.wrapper} data-testid="main-view-v2">
      {hasRecords && (
        <RecordListViewV2
          sections={sections}
          isMultiSelectOn={isMultiSelectOn}
          selectedRecords={selectedRecords}
          setSelectedRecords={setSelectedRecords}
          setIsMultiSelectOn={setIsMultiSelectOn}
        />
      )}

      {!hasRecords && !hasSearch && !isLoading && <EmptyCollectionViewV2 />}

      {!hasRecords && hasSearch && !isLoading && <EmptyResultsViewV2 />}
    </div>
  )
}
