import { ReservationPoliciesPage } from './components/ReservationPoliciesPage'
import { roomChangePolicyConfig } from './policyPageConfigs'

export function RoomChangePoliciesPage() {
  return <ReservationPoliciesPage config={roomChangePolicyConfig} />
}
