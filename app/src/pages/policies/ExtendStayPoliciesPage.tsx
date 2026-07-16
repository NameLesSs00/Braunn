import { ReservationPoliciesPage } from './components/ReservationPoliciesPage'
import { extendStayPolicyConfig } from './policyPageConfigs'

export function ExtendStayPoliciesPage() {
  return <ReservationPoliciesPage config={extendStayPolicyConfig} />
}
