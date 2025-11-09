import React from 'react'

export function HomeIcon({ strokeWidth = 1.8 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <path d="M3 11.5l9-7 9 7" />
      <path d="M5 10.5v9h14v-9" />
    </svg>
  )
}

export function WalletIcon({ strokeWidth = 1.8 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <rect x="3" y="6" width="18" height="12" rx="3" />
      <path d="M15 12h5" />
    </svg>
  )
}

export function UserIcon({ strokeWidth = 1.8 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <circle cx="12" cy="7.5" r="3.3" />
      <path d="M4.8 20.2a7.2 7.2 0 0114.4 0" />
    </svg>
  )
}

export function EnvelopeIcon({ strokeWidth = 1.8 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

export function LockIcon({ strokeWidth = 1.8 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V8a4 4 0 118 0v2" />
    </svg>
  )
}

export function SunIcon({ strokeWidth = 1.8 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </svg>
  )
}

export function MoonIcon({ strokeWidth = 1.8 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <path d="M21 12.5A9 9 0 1111.5 3a7 7 0 009.5 9.5z" />
    </svg>
  )
}