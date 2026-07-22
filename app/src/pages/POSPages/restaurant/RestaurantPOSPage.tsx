import { useEffect, useState } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import { ChefKitchenView } from './components/ChefKitchenView'
import { RoleSwitcher } from './components/RoleSwitcher'
import type { RestaurantRole } from './data/restaurantPOSData'

const roleStorageKey = 'restaurant-pos-preview-role'
const adminPreviewStorageKey = 'restaurant-pos-admin-preview'

function readStoredRole(): RestaurantRole {
  const storedRole = localStorage.getItem(roleStorageKey)
  if (storedRole === 'admin' || storedRole === 'cashier' || storedRole === 'chef') return storedRole
  return 'cashier'
}

function readStoredAdminPreview(): 'cashier' | 'chef' {
  const storedPreview = localStorage.getItem(adminPreviewStorageKey)
  if (storedPreview === 'chef') return 'chef'
  return 'cashier'
}

export function RestaurantPOSPage() {
  const [searchParams] = useSearchParams()
  const [role, setRole] = useState<RestaurantRole>(() => readStoredRole())
  const [adminPreview, setAdminPreview] = useState<'cashier' | 'chef'>(() => readStoredAdminPreview())
  const roleParam = searchParams.get('role')
  const previewParam = roleParam === 'chef' || roleParam === 'cashier' ? roleParam : null

  useEffect(() => {
    localStorage.setItem(roleStorageKey, role)
  }, [role])

  useEffect(() => {
    localStorage.setItem(adminPreviewStorageKey, adminPreview)
  }, [adminPreview])

  const visibleView = previewParam ?? (role === 'admin' ? adminPreview : role)

  return (
    <>
      {visibleView === 'chef' ? (
        <ChefKitchenView />
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
