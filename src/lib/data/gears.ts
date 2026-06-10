import rawGearsData from './gears.json';
import { Gear } from '@/types';

// Process raw gears to ensure tags are derived correctly
export const gears: Gear[] = (rawGearsData.gears as any[]).map(gear => {
  const autoTags = gear.autoTags || [];
  const manualTags = gear.manualTags || [];
  
  // Create a unique set of tags combining auto and manual tags
  const tagsSet = new Set([...autoTags, ...manualTags]);
  
  return {
    ...gear,
    autoTags,
    manualTags,
    tags: Array.from(tagsSet)
  };
});

export default { gears };
