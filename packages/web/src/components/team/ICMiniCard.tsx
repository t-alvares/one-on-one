import { Link } from 'react-router-dom';
import { User, Calendar } from 'lucide-react';
import type { TeamMember } from '@/hooks/useTeam';

interface ICMiniCardProps {
  member: TeamMember;
}

export function ICMiniCard({ member }: ICMiniCardProps) {
  return (
    <div className="group flex items-start gap-3 py-1">
      {/* Circle marker on the line */}
      <div className="relative z-10 mt-3 w-[11px] h-[11px] rounded-full border border-border bg-white flex-shrink-0 group-hover:border-text-tertiary transition-colors" />

      {/* Card */}
      <Link
        to={`/team/${member.id}`}
        className="flex-1 bg-white border rounded-lg p-3 shadow-sm transition-all hover:shadow-md hover:border-gray-300 relative"
      >
        {/* Scheduled meetings badge - top right */}
        {member.upcomingMeetingCount > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{member.upcomingMeetingCount}</span>
          </div>
        )}

        <div className="flex items-start gap-3">
          {/* Avatar/Icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-8">
            <div className="font-medium text-sm text-gray-900 truncate">
              {member.name}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {member.position || 'No position'}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
