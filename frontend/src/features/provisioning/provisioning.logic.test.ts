import { describe, expect, it } from 'vitest';
import { IT_OPS_FIXTURE_NOTIFICATIONS } from '@/features/provisioning/provisioning.fixtures';
import {
  filterProvisioningTasks,
  isProvisioningTask,
} from '@/features/provisioning/provisioning.logic';

describe('provisioning.logic (WO-028)', () => {
  it('identifies provisioning notification type', () => {
    expect(isProvisioningTask(IT_OPS_FIXTURE_NOTIFICATIONS[0]!)).toBe(true);
  });

  it('filters provisioning tasks from mixed notifications', () => {
    const mixed = [
      ...IT_OPS_FIXTURE_NOTIFICATIONS,
      {
        ...IT_OPS_FIXTURE_NOTIFICATIONS[0]!,
        id: 'other',
        type: 'onboarding',
      },
    ];
    expect(filterProvisioningTasks(mixed)).toHaveLength(3);
  });
});
