import { ArrowRightLeft, Ban, CalendarPlus, Clock, Moon } from 'lucide-react'

import type {
  CancellationPolicySettings,
  EarlyCheckoutPolicySettings,
  ExtendStayPolicySettings,
  LateCheckoutPolicySettings,
  RoomChangePolicySettings,
} from '../../models/ReservationPolicy'
import type { ReservationPolicyPageConfig } from './components/ReservationPoliciesPage'
import {
  createCancellationPolicy,
  createEarlyCheckoutPolicy,
  createExtendStayPolicy,
  createLateCheckoutPolicy,
  createRoomChangePolicy,
  updateCancellationPolicy,
  updateEarlyCheckoutPolicy,
  updateExtendStayPolicy,
  updateLateCheckoutPolicy,
  updateRoomChangePolicy,
} from '../../shared/apis/reservationPoliciesApi'

export const cancellationPolicyConfig: ReservationPolicyPageConfig<CancellationPolicySettings> = {
  policyType: 'Cancellation',
  title: 'Cancellation Policies',
  description: 'Manage cancellation cutoffs, penalty percentages, and manual approval rules.',
  Icon: Ban,
  defaultSettings: {
    freeCancellationBeforeHours: 0,
    percentage: 0,
    requiresManualApproval: false,
  },
  settingsFields: [
    { key: 'freeCancellationBeforeHours', label: 'Free Cancellation Before', type: 'number', min: 0, suffix: 'hrs' },
    { key: 'percentage', label: 'Penalty Percentage', type: 'number', min: 0, suffix: '%' },
    { key: 'requiresManualApproval', label: 'Requires Manual Approval', type: 'checkbox' },
  ],
  settingsSummary: (settings) => `${settings.freeCancellationBeforeHours} hrs free, ${settings.percentage}% penalty${settings.requiresManualApproval ? ', approval required' : ''}`,
  createPolicy: createCancellationPolicy,
  updatePolicy: updateCancellationPolicy,
}

export const earlyCheckoutPolicyConfig: ReservationPolicyPageConfig<EarlyCheckoutPolicySettings> = {
  policyType: 'EarlyCheckout',
  title: 'Early Checkout Policies',
  description: 'Manage early checkout credit percentages and approval requirements.',
  Icon: Clock,
  includeReservationApplicability: true,
  defaultSettings: {
    percentage: 0,
    requiresManualApproval: false,
  },
  settingsFields: [
    { key: 'percentage', label: 'Credit Percentage', type: 'number', min: 0, suffix: '%' },
    { key: 'requiresManualApproval', label: 'Requires Manual Approval', type: 'checkbox' },
  ],
  settingsSummary: (settings) => `${settings.percentage}% credit${settings.requiresManualApproval ? ', approval required' : ''}`,
  createPolicy: createEarlyCheckoutPolicy,
  updatePolicy: updateEarlyCheckoutPolicy,
}

export const lateCheckoutPolicyConfig: ReservationPolicyPageConfig<LateCheckoutPolicySettings> = {
  policyType: 'LateCheckout',
  title: 'Late Checkout Policies',
  description: 'Manage free, half-day, and full-day late checkout pricing bands.',
  Icon: Moon,
  includeReservationApplicability: true,
  defaultSettings: {
    freeUntil: '12:00',
    halfDayUntil: '18:00',
    halfDayPercentage: 50,
    fullDayPercentage: 100,
    requiresManualApproval: false,
    pricingSource: 'BookedRate',
  },
  settingsFields: [
    { key: 'freeUntil', label: 'Free Until', type: 'time' },
    { key: 'halfDayUntil', label: 'Half Day Until', type: 'time' },
    { key: 'halfDayPercentage', label: 'Half Day Percentage', type: 'number', min: 0, suffix: '%' },
    { key: 'fullDayPercentage', label: 'Full Day Percentage', type: 'number', min: 0, suffix: '%' },
    {
      key: 'pricingSource',
      label: 'Pricing Source',
      type: 'select',
      options: [
        { label: 'Booked Rate', value: 'BookedRate' },
      ],
    },
    { key: 'requiresManualApproval', label: 'Requires Manual Approval', type: 'checkbox' },
  ],
  settingsSummary: (settings) => `Free until ${settings.freeUntil}, half ${settings.halfDayPercentage}%, full ${settings.fullDayPercentage}%`,
  createPolicy: createLateCheckoutPolicy,
  updatePolicy: updateLateCheckoutPolicy,
}

export const extendStayPolicyConfig: ReservationPolicyPageConfig<ExtendStayPolicySettings> = {
  policyType: 'ExtendStay',
  title: 'Extend Stay Policies',
  description: 'Manage whether extensions are allowed, availability checks, and approval rules.',
  Icon: CalendarPlus,
  includeReservationApplicability: true,
  defaultSettings: {
    isAllowed: true,
    availabilityRequired: true,
    requiresManualApproval: false,
  },
  settingsFields: [
    { key: 'isAllowed', label: 'Extension Allowed', type: 'checkbox' },
    { key: 'availabilityRequired', label: 'Availability Required', type: 'checkbox' },
    { key: 'requiresManualApproval', label: 'Requires Manual Approval', type: 'checkbox' },
  ],
  settingsSummary: (settings) => `${settings.isAllowed ? 'Allowed' : 'Not allowed'}${settings.availabilityRequired ? ', availability required' : ''}${settings.requiresManualApproval ? ', approval required' : ''}`,
  createPolicy: createExtendStayPolicy,
  updatePolicy: updateExtendStayPolicy,
}

export const roomChangePolicyConfig: ReservationPolicyPageConfig<RoomChangePolicySettings> = {
  policyType: 'RoomChange',
  title: 'Room Change Policies',
  description: 'Manage operational moves, upgrade charges, downgrade behavior, and approval rules.',
  Icon: ArrowRightLeft,
  includeReservationApplicability: true,
  defaultSettings: {
    operationalMoveAllowed: true,
    upgradePricingBehavior: 'ChargeRateDifference',
    downgradeBehavior: 'NoRefund',
    downgradeRefundBehavior: 'NoRefund',
    requiresManualApproval: false,
  },
  settingsFields: [
    { key: 'operationalMoveAllowed', label: 'Operational Move Allowed', type: 'checkbox' },
    {
      key: 'upgradePricingBehavior',
      label: 'Upgrade Pricing Behavior',
      type: 'select',
      options: [
        { label: 'Charge Rate Difference', value: 'ChargeRateDifference' },
        { label: 'No Charge', value: 'NoCharge' },
      ],
    },
    {
      key: 'downgradeBehavior',
      label: 'Downgrade Behavior',
      type: 'select',
      options: [
        { label: 'No Refund', value: 'NoRefund' },
        { label: 'Refund Difference', value: 'RefundDifference' },
      ],
    },
    {
      key: 'downgradeRefundBehavior',
      label: 'Downgrade Refund Behavior',
      type: 'select',
      options: [
        { label: 'No Refund', value: 'NoRefund' },
        { label: 'Refund Difference', value: 'RefundDifference' },
      ],
    },
    { key: 'requiresManualApproval', label: 'Requires Manual Approval', type: 'checkbox' },
  ],
  settingsSummary: (settings) => `${settings.operationalMoveAllowed ? 'Move allowed' : 'Move blocked'}, upgrade: ${settings.upgradePricingBehavior}, downgrade: ${settings.downgradeBehavior}`,
  createPolicy: createRoomChangePolicy,
  updatePolicy: updateRoomChangePolicy,
}
