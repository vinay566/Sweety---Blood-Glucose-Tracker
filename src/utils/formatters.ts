import { ReadingSlot } from '../types';

export function formatSlotLabel(slot: string | ReadingSlot): string {
  switch (slot) {
    case 'morning_fasting':
      return 'Morning fasting';
    case 'after_breakfast':
      return 'After breakfast';
    case 'after_lunch':
      return 'After lunch';
    case 'after_dinner':
      return 'After dinner';
    default:
      return slot.replace(/_/g, ' ');
  }
}
