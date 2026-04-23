import React, { useEffect, useMemo, useState } from 'react'

import { useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { useRecords } from '@tetherto/pearpass-lib-vault'

import { createStyles } from './MainViewV2.styles'
import {
  SORT_BY_TYPE,
  SORT_KEYS,
  type SortKey
} from '../../constants/sortOptions'
import { BrowserExtensionDialogV2 } from '../../containers/Modal/BrowserExtensionDialogV2'
import { EmptyCollectionViewV2 } from '../../containers/EmptyCollectionViewV2'
import { EmptyResultsViewV2 } from '../../containers/EmptyResultsViewV2'
import { MainViewHeader } from '../../containers/MainViewHeader/MainViewHeader'
import { RecordListViewV2 } from '../../containers/RecordListView/RecordListViewV2'
import { useAppHeaderContext } from '../../context/AppHeaderContext'
import { useGlobalLoading } from '../../context/LoadingContext'
import { useModal } from '../../context/ModalContext'
import { useRouter } from '../../context/RouterContext'
import { isNativeMessagingIPCRunning } from '../../services/nativeMessagingIPCServer'
import { getNativeMessagingEnabled } from '../../services/nativeMessagingPreferences'
import { groupRecordsByTimePeriod } from '../../utils/groupRecordsByTimePeriod'
import { isFavorite } from '../../utils/isFavorite'

export const MainViewV2 = () => {
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { setModal } = useModal()
  const { searchValue } = useAppHeaderContext()
  const { data: routerData } = useRouter()

  const [sortKey, setSortKey] = useState<SortKey>(
    SORT_KEYS.LAST_UPDATED_NEWEST
  )
  const [isMultiSelectOn, setIsMultiSelectOn] = useState(false)
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])

  useEffect(() => {
    if (!isMultiSelectOn) setSelectedRecords([])
  }, [isMultiSelectOn])

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

  const sort = useMemo(() => SORT_BY_TYPE[sortKey], [sortKey])

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
    setIsMultiSelectOn(false)
  }, [routerData?.folder, routerData?.recordType, searchValue])

  const hasRecords = !!records?.length
  const hasSearch = !!searchValue.length

  return (
    <div style={styles.wrapper} data-testid="main-view-v2">
      <MainViewHeader
        sortKey={sortKey}
        setSortKey={setSortKey}
        isMultiSelectOn={isMultiSelectOn}
        setIsMultiSelectOn={setIsMultiSelectOn}
      />

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
