import { ReservationPoliciesPage } from './components/ReservationPoliciesPage'
import { earlyCheckoutPolicyConfig } from './policyPageConfigs'

export function EarlyCheckoutPoliciesPage() {
  return <ReservationPoliciesPage config={earlyCheckoutPolicyConfig} />
}
