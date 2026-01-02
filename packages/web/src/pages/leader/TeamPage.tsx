import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useTeamBoard, type TeamMember } from '@/hooks/useTeam';
import { PositionColumn, UnassignedColumn } from '@/components/team/PositionColumn';

export function TeamPage() {
  const { data: teamBoard, isLoading, error } = useTeamBoard();

  // Sort members alphabetically within each column
  const sortedTeamBoard = useMemo(() => {
    if (!teamBoard) return null;

    const sortMembers = (members: TeamMember[]) => {
      return [...members].sort((a, b) => a.name.localeCompare(b.name));
    };

    return {
      positionTypes: teamBoard.positionTypes.map((pt) => ({
        ...pt,
        members: sortMembers(pt.members),
      })),
      unassigned: sortMembers(teamBoard.unassigned),
    };
  }, [teamBoard]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load team data</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!sortedTeamBoard) {
    return null;
  }

  // Calculate number of columns for grid
  const columnCount = sortedTeamBoard.positionTypes.length + (sortedTeamBoard.unassigned.length > 0 ? 1 : 0);

  return (
    <div className="flex flex-col h-full">
      {/* Team Board */}
      <div
        className="grid gap-4 flex-1"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, minmax(280px, 1fr))`,
        }}
      >
        {/* Position Type Columns */}
        {sortedTeamBoard.positionTypes.map((positionType) => (
          <PositionColumn
            key={positionType.id}
            positionType={positionType}
          />
        ))}

        {/* Unassigned Column */}
        {sortedTeamBoard.unassigned.length > 0 && (
          <UnassignedColumn members={sortedTeamBoard.unassigned} />
        )}
      </div>
    </div>
  );
}
