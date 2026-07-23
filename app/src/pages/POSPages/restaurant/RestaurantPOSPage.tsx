import { useEffect, useState } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import { AdminPOSView } from './components/AdminPOSView'
import { ChefKitchenView } from './components/ChefKitchenView'
import { RoleSwitcher } from './components/RoleSwitcher'
import type { RestaurantRole } from './data/restaurantPOSData'

const roleStorageKey = 'restaurant-pos-preview-role'
const adminPreviewStorageKey = 'restaurant-pos-admin-view'

function readStoredRole(): RestaurantRole {
  const storedRole = localStorage.getItem(roleStorageKey)
  if (storedRole === 'admin' || storedRole === 'cashier' || storedRole === 'chef') return storedRole
  return 'cashier'
}

function readStoredAdminPreview(): RestaurantRole {
  const storedPreview = localStorage.getItem(adminPreviewStorageKey)
  if (storedPreview === 'admin' || storedPreview === 'cashier' || storedPreview === 'chef') return storedPreview
  return 'admin'
}

function readPreviewParam(role: RestaurantRole, roleParam: string | null): RestaurantRole | null {
  if (role !== 'admin') return null
  if (roleParam === 'admin' || roleParam === 'cashier' || roleParam === 'chef') return roleParam
  return null
}

export function RestaurantPOSPage() {
  const [searchParams] = useSearchParams()
  const [role, setRole] = useState<RestaurantRole>(() => readStoredRole())
  const [adminPreview, setAdminPreview] = useState<RestaurantRole>(() => readStoredAdminPreview())
  const roleParam = searchParams.get('role')
  const previewParam = readPreviewParam(role, roleParam)

  useEffect(() => {
    localStorage.setItem(roleStorageKey, role)
  }, [role])

  useEffect(() => {
    localStorage.setItem(adminPreviewStorageKey, adminPreview)
  }, [adminPreview])

  const visibleView = role === 'admin' ? (previewParam ?? adminPreview) : role

  return (
    <>
      {visibleView === 'chef' ? (
        <ChefKitchenView />
      ) : visibleView === 'admin' ? (
        <AdminPOSView />
      ) : (
        <Outlet />
      )}

      <RoleSwitcher
        role={role}
        onRoleChange={setRole}
        adminPreview={adminPreview}
        onAdminPreviewChange={setAdminPreview}
      />
    </>
  )
}
