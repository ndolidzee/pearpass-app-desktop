import React, { useCallback, useMemo, useState } from 'react'

import { ListItem, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import {
  ErrorFilled,
  ExpandMore,
  StarFilled
} from '@tetherto/pearpass-lib-ui-kit/icons'

import { createStyles } from './RecordListViewV2.styles'
import { RecordItemIcon } from '../../components/RecordItemIcon'
import { useRouter } from '../../context/RouterContext'
import { useTranslation } from '../../hooks/useTranslation'
import { getRecordSubtitle } from '../../utils/getRecordSubtitle'
import type {
  RecordSection,
  VaultRecord
} from '../../utils/groupRecordsByTimePeriod'

type RecordListViewV2Props = {
  sections: RecordSection[]
  isMultiSelectOn?: boolean
  selectedRecords?: string[]
  setSelectedRecords?: (
    updater: string[] | ((prev: string[]) => string[])
  ) => void
  setIsMultiSelectOn?: (value: boolean) => void
}

const SECTION_TITLE_KEYS: Record<string, string> = {
  favorites: 'Favorites',
  all: 'All Items',
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This Week',
  thisMonth: 'This Month',
  older: 'Older'
}

export const RecordListViewV2 = ({
  sections,
  isMultiSelectOn = false,
  selectedRecords = [],
  setSelectedRecords
}: RecordListViewV2Props) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { currentPage, navigate, data: routeData } = useRouter()
  const styles = createStyles(theme.colors)

  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({})

  const toggleSection = useCallback((key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const selectedRecordsSet = useMemo(
    () => new Set(selectedRecords),
    [selectedRecords]
  )

  const handleRecordPress = useCallback(
    (record: VaultRecord) => {
      if (isMultiSelectOn) {
        setSelectedRecords?.((prev) =>
          prev.includes(record.id)
            ? prev.filter((id) => id !== record.id)
            : [...prev, record.id]
        )
        return
      }
      navigate(currentPage, {
        recordId: record.id,
        recordType: routeData?.recordType
      })
    },
    [
      isMultiSelectOn,
      setSelectedRecords,
      navigate,
      currentPage,
      routeData?.recordType
    ]
  )

  const iconColor = theme.colors.colorTextSecondary
  const alertColor = theme.colors.colorSurfaceDestructiveElevated

  return (
    <div style={styles.wrapper}>
      <div style={styles.scrollArea} data-testid="record-list-v2">
        {sections.map((section, sectionIndex) => {
          const isCollapsed = !!collapsedSections[section.key]
          const labelKey = SECTION_TITLE_KEYS[section.key] ?? section.title
          const label = t(labelKey)
          const isLastSection = sectionIndex === sections.length - 1

          return (
            <React.Fragment key={section.key}>
              <div style={styles.section}>
                <button
                  type="button"
                  style={styles.sectionHeader}
                  onClick={() => toggleSection(section.key)}
                  data-testid={`record-list-section-${section.key}`}
                >
                  <div
                    style={{
                      ...styles.sectionHeaderChevron,
                      ...(isCollapsed
                        ? styles.sectionHeaderChevronCollapsed
                        : {})
                    }}
                  >
                    <ExpandMore width={16} height={16} color={iconColor} />
                  </div>

                  {section.isFavorites && (
                    <StarFilled width={14} height={14} color={iconColor} />
                  )}

                  <span>{label}</span>
                </button>

                {!isCollapsed && (
                  <div style={styles.sectionList}>
                    {section.data.map((record) => {
                      const isSelected = selectedRecordsSet.has(record.id)
                      return (
                        <ListItem
                          key={record.id}
                          icon={<RecordItemIcon record={record} />}
                          iconSize={32}
                          title={record.data?.title ?? ''}
                          subtitle={getRecordSubtitle(record) || undefined}
                          selectionMode={isMultiSelectOn ? 'multi' : 'none'}
                          isSelected={isSelected}
                          onSelect={() => handleRecordPress(record)}
                          onClick={() => handleRecordPress(record)}
                          testID={`record-list-item-${record.id}`}
                          style={
                            styles.recordRow as React.ComponentProps<
                              typeof ListItem
                            >['style']
                          }
                          rightElement={
                            !isMultiSelectOn ? (
                              <div style={styles.rowRightElement}>
                                {record.hasSecurityAlert && (
                                  <ErrorFilled
                                    width={20}
                                    height={20}
                                    color={alertColor}
                                  />
                                )}
                                <div style={styles.rowChevron}>
                                  <ExpandMore
                                    width={20}
                                    height={20}
                                    color={iconColor}
                                  />
                                </div>
                              </div>
                            ) : undefined
                          }
                        />
                      )
                    })}
                  </div>
                )}
              </div>
              {!isLastSection && (
                <div
                  style={styles.divider}
                  role="separator"
                  data-testid={`record-list-divider-${section.key}`}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      <div style={styles.fadeGradient} aria-hidden="true" />
    </div>
  )
}
