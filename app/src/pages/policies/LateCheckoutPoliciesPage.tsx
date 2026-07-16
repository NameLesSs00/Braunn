import { ReservationPoliciesPage } from './components/ReservationPoliciesPage'
import { lateCheckoutPolicyConfig } from './policyPageConfigs'

export function LateCheckoutPoliciesPage() {
  return <ReservationPoliciesPage config={lateCheckoutPolicyConfig} />
}
