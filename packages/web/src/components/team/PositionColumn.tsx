import { Users2 } from 'lucide-react';
import { ICMiniCard } from './ICMiniCard';
import { PositionTypeIcon, ICON_SIZES } from '@/components/icons';
import type { PositionType as PositionTypeData } from '@/hooks/useTeam';

interface PositionColumnProps {
  positionType: PositionTypeData;
}

export function PositionColumn({ positionType }: PositionColumnProps) {
  return (
    <div className="flex flex-col">
      {/* Column Header */}
      <h2 className="flex items-center gap-2 text-base font-medium text-text-secondary mb-6 tracking-wide flex-shrink-0">
        <PositionTypeIcon size={ICON_SIZES.sectionHeader} animateOnHover />
        <span>{positionType.name}</span>
        <span className="text-xs text-text-tertiary font-normal">
          ({positionType.members.length})
        </span>
      </h2>

      {/* Members List */}
      {positionType.members.length > 0 ? (
        <div className="relative flex-1">
          {/* Vertical connecting line */}
          <div className="absolute left-[5px] top-[16px] bottom-0 w-[1px] bg-border" />
          {/* Member cards */}
          <div className="space-y-0">
            {positionType.members.map((member) => (
              <ICMiniCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 px-4 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-sm text-gray-400 text-center">
            No team members
          </p>
        </div>
      )}
    </div>
  );
}

// Unassigned column component
interface UnassignedColumnProps {
  members: PositionTypeData['members'];
}

export function UnassignedColumn({ members }: UnassignedColumnProps) {
  if (members.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {/* Column Header */}
      <h2 className="flex items-center gap-2 text-base font-medium text-amber-600 mb-6 tracking-wide flex-shrink-0">
        <Users2 className="w-5 h-5" />
        <span>Unassigned</span>
        <span className="text-xs text-amber-500 font-normal">
          ({members.length})
        </span>
      </h2>

      {/* Members List */}
      <div className="relative flex-1">
        {/* Vertical connecting line */}
        <div className="absolute left-[5px] top-[16px] bottom-0 w-[1px] bg-amber-200" />
        {/* Member cards */}
        <div className="space-y-0">
          {members.map((member) => (
            <ICMiniCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
}
