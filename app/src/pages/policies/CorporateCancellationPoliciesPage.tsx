import { ReservationPoliciesPage } from './components/ReservationPoliciesPage'
import { cancellationPolicyConfig } from './policyPageConfigs'

export function CorporateCancellationPoliciesPage() {
  return <ReservationPoliciesPage config={cancellationPolicyConfig} />
}
