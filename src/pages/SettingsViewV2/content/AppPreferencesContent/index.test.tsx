/// <reference types="@testing-library/jest-dom" />

import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { LOCAL_STORAGE_KEYS } from '../../../../constants/localStorage'
import { AppPreferencesContent } from './index'

jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

const mockSetTimeoutMs = jest.fn()
let mockTimeoutMs: number | null = 60_000

jest.mock('../../../../hooks/useAutoLockPreferences', () => ({
  useAutoLockPreferences: () => ({
    timeoutMs: mockTimeoutMs,
    setTimeoutMs: mockSetTimeoutMs,
    isAutoLockEnabled: true,
    setAutoLockEnabled: jest.fn(),
    shouldBypassAutoLock: false,
    setShouldBypassAutoLock: jest.fn()
  })
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  KeyboardArrowBottom: () => null
}))

jest.mock('@tetherto/pearpass-lib-constants', () => ({
  AUTO_LOCK_ENABLED: true,
  AUTO_LOCK_TIMEOUT_OPTIONS: {
    ONE_MINUTE: { label: '1 Minute', value: 60_000 },
    TEN_MINUTES: { label: '10 Minutes', value: 600_000 }
  }
}))

jest.mock('./styles', () => ({
  createStyles: () => ({
    root: {},
    sectionHeading: {},
    settingCard: {},
    row: {},
    rowDivider: {},
    toggleColumn: {},
    dropdownMenu: {}
  })
}))

const mockTheme = {
  theme: {
    colors: {
      colorTextSecondary: '#888',
      colorTextPrimary: '#fff',
      colorBorderPrimary: '#333',
      colorSurfacePrimary: '#111'
    }
  }
}

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  useTheme: () => mockTheme,
  Title: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  Text: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ToggleSwitch: (props: {
    'data-testid'?: string
    checked?: boolean
    onChange?: (checked: boolean) => void
    label?: string
  }) => {
    const testId = props['data-testid']
    return (
      <button
        type="button"
        role="switch"
        data-testid={testId}
        aria-checked={props.checked}
        onClick={() => props.onChange?.(!props.checked)}
      >
        {props.label}
      </button>
    )
  },
  Button: (props: {
    'data-testid'?: string
    children?: React.ReactNode
    onClick?: () => void
    iconAfter?: React.ReactNode
  }) => (
    <button
      type="button"
      data-testid={props['data-testid']}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  ),
  Dropdown: (props: {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    trigger: React.ReactNode
    children: React.ReactNode
  }) => (
    <div>
      <div onClick={() => props.onOpenChange?.(!props.open)}>
        {props.trigger}
      </div>
      {props.open ? <div data-testid="dropdown-menu">{props.children}</div> : null}
    </div>
  ),
  ListItem: (props: {
    testID?: string
    title: string
    selected?: boolean
    onClick?: () => void
  }) => (
    <button
      type="button"
      data-testid={props.testID}
      aria-pressed={props.selected}
      onClick={props.onClick}
    >
      {props.title}
    </button>
  )
}))

beforeEach(() => {
  localStorage.clear()
  mockSetTimeoutMs.mockClear()
  mockTimeoutMs = 60_000
})

describe('AppPreferencesContent', () => {
  it('renders the heading and both rows', () => {
    render(<AppPreferencesContent />)
    expect(screen.getByText('App Preferences')).toBeInTheDocument()
    expect(screen.getByText('Auto Lock')).toBeInTheDocument()
    expect(screen.getByText('Reminders')).toBeInTheDocument()
  })

  it('shows the current timeout in the select field', () => {
    render(<AppPreferencesContent />)
    expect(screen.getByTestId('settings-auto-lock-select').textContent).toBe(
      '1 Minute'
    )
  })

  it('calls setTimeoutMs when an option is clicked', () => {
    render(<AppPreferencesContent />)
    fireEvent.click(screen.getByTestId('settings-auto-lock-select'))
    fireEvent.click(
      screen.getByTestId('settings-auto-lock-option-ten_minutes')
    )
    expect(mockSetTimeoutMs).toHaveBeenCalledWith(600_000)
  })

  it('starts with reminders enabled when localStorage has no value', () => {
    render(<AppPreferencesContent />)
    expect(screen.getByTestId('settings-reminders-toggle')).toHaveAttribute(
      'aria-checked',
      'true'
    )
  })

  it('starts with reminders disabled when localStorage value is "false"', () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED,
      'false'
    )
    render(<AppPreferencesContent />)
    expect(screen.getByTestId('settings-reminders-toggle')).toHaveAttribute(
      'aria-checked',
      'false'
    )
  })

  it('writes "false" to localStorage when reminders is toggled off', () => {
    render(<AppPreferencesContent />)
    fireEvent.click(screen.getByTestId('settings-reminders-toggle'))
    expect(
      localStorage.getItem(LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED)
    ).toBe('false')
  })

  it('removes the localStorage key when reminders is toggled back on', () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED,
      'false'
    )
    render(<AppPreferencesContent />)
    fireEvent.click(screen.getByTestId('settings-reminders-toggle'))
    expect(
      localStorage.getItem(LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED)
    ).toBeNull()
  })
})
