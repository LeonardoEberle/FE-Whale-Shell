import React from 'react'
import { Outlet } from 'react-router-dom'
import TopNav from './TopNav.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedLayout() {
  const { userName, userEmail } = useAuth()
  return (
    <>
      <TopNav userName={userName || userEmail || 'Usuário'} />
      <Outlet />
    </>
  )
}