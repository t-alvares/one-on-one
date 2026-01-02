import prisma from '../lib/prisma';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  position: string | null;
  positionType: string | null;
  teamDisplayOrder: number | null;
  relationshipId: string;
  upcomingMeetingCount: number;
  pendingActionCount: number;
}

export interface PositionTypeWithMembers {
  id: string;
  name: string;
  code: string;
  displayOrder: number;
  members: TeamMember[];
}

export interface TeamBoard {
  positionTypes: PositionTypeWithMembers[];
  unassigned: TeamMember[];
}

// Mapping from position type codes to display names
const positionTypeDisplayNames: Record<string, string> = {
  SOLUTIONS_ANALYST: 'Solutions Analysts',
  DEVELOPER: 'Developers',
  SYSTEM_ADMIN: 'System Administrators',
  QA_ANALYST: 'QA Analysts',
  PROJECT_MANAGER: 'Project Managers',
  BUSINESS_ANALYST: 'Business Analysts',
  DATA_ANALYST: 'Data Analysts',
  DEVOPS: 'DevOps Engineers',
  ARCHITECT: 'Architects',
  DESIGNER: 'Designers',
};

function getDisplayNameForPositionType(code: string): string {
  return positionTypeDisplayNames[code] || code.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Get leader's team grouped by position type
 * Columns are auto-generated from distinct positionType values of ICs
 */
export async function getTeamGroupedByPosition(leaderId: string): Promise<TeamBoard> {
  // Get all ICs for this leader with their relationship
  const relationships = await prisma.relationship.findMany({
    where: { leaderId },
    include: {
      ic: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          position: true,
          positionType: true,
          teamDisplayOrder: true,
        },
      },
    },
  });

  // Get counts for each IC
  const teamMembers: TeamMember[] = await Promise.all(
    relationships.map(async (rel) => {
      const [upcomingMeetingCount, pendingActionCount] = await Promise.all([
        prisma.meeting.count({
          where: {
            relationshipId: rel.id,
            status: 'SCHEDULED',
            scheduledAt: { gte: new Date() },
          },
        }),
        prisma.action.count({
          where: {
            ownerId: rel.icId,
            status: { in: ['NOT_STARTED', 'IN_PROGRESS'] },
          },
        }),
      ]);

      return {
        id: rel.ic.id,
        name: rel.ic.name,
        email: rel.ic.email,
        avatarUrl: rel.ic.avatarUrl,
        position: rel.ic.position,
        positionType: rel.ic.positionType,
        teamDisplayOrder: rel.ic.teamDisplayOrder,
        relationshipId: rel.id,
        upcomingMeetingCount,
        pendingActionCount,
      };
    })
  );

  // Get distinct position types from ICs (auto-generate columns)
  const distinctPositionTypes = new Set<string>();
  for (const member of teamMembers) {
    if (member.positionType) {
      distinctPositionTypes.add(member.positionType);
    }
  }

  // Sort position types alphabetically by display name
  const sortedPositionTypes = Array.from(distinctPositionTypes).sort((a, b) =>
    getDisplayNameForPositionType(a).localeCompare(getDisplayNameForPositionType(b))
  );

  // Create position type columns with members
  const positionTypesWithMembers: PositionTypeWithMembers[] = sortedPositionTypes.map((code, index) => ({
    id: code, // Use code as ID since these are auto-generated
    name: getDisplayNameForPositionType(code),
    code,
    displayOrder: index,
    members: teamMembers
      .filter((m) => m.positionType === code)
      .sort((a, b) => (a.teamDisplayOrder ?? 0) - (b.teamDisplayOrder ?? 0)),
  }));

  // Get unassigned members (no positionType)
  const unassigned = teamMembers
    .filter((m) => !m.positionType)
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    positionTypes: positionTypesWithMembers,
    unassigned,
  };
}

/**
 * Get specific IC details for a leader
 */
export async function getICDetails(leaderId: string, icId: string) {
  const relationship = await prisma.relationship.findFirst({
    where: { leaderId, icId },
    include: {
      ic: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          position: true,
          positionType: true,
          teamDisplayOrder: true,
          yearsOfService: true,
          timeInPosition: true,
          createdAt: true,
        },
      },
    },
  });

  if (!relationship) {
    return null;
  }

  // Get additional stats
  const [upcomingMeetings, recentMeetings, pendingActions, completedActions] = await Promise.all([
    prisma.meeting.findMany({
      where: {
        relationshipId: relationship.id,
        status: 'SCHEDULED',
        scheduledAt: { gte: new Date() },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    }),
    prisma.meeting.findMany({
      where: {
        relationshipId: relationship.id,
        status: 'COMPLETED',
      },
      orderBy: { scheduledAt: 'desc' },
      take: 5,
    }),
    prisma.action.count({
      where: {
        ownerId: icId,
        status: { in: ['NOT_STARTED', 'IN_PROGRESS'] },
      },
    }),
    prisma.action.count({
      where: {
        ownerId: icId,
        status: 'COMPLETED',
      },
    }),
  ]);

  return {
    ...relationship.ic,
    relationshipId: relationship.id,
    upcomingMeetings,
    recentMeetings,
    pendingActions,
    completedActions,
  };
}

/**
 * Reorder an IC (move between columns or within a column)
 */
export async function reorderIC(
  leaderId: string,
  icId: string,
  positionType: string | null,
  displayOrder: number
): Promise<boolean> {
  // Verify the IC belongs to this leader
  const relationship = await prisma.relationship.findFirst({
    where: { leaderId, icId },
  });

  if (!relationship) {
    return false;
  }

  // If moving to a position type, verify it belongs to this leader
  if (positionType) {
    const pt = await prisma.positionType.findFirst({
      where: { leaderId, code: positionType },
    });
    if (!pt) {
      return false;
    }
  }

  // Get current position type of the IC
  const ic = await prisma.user.findUnique({
    where: { id: icId },
    select: { positionType: true, teamDisplayOrder: true },
  });

  const oldPositionType = ic?.positionType;

  // Update the IC's position
  await prisma.user.update({
    where: { id: icId },
    data: {
      positionType,
      teamDisplayOrder: displayOrder,
    },
  });

  // Reorder other ICs in the new column (shift down those at or after displayOrder)
  if (positionType) {
    const icsInNewColumn = await prisma.user.findMany({
      where: {
        id: { not: icId },
        positionType,
        icRelationship: { leaderId },
      },
      orderBy: { teamDisplayOrder: 'asc' },
    });

    // Renumber all ICs in the column
    let order = 0;
    for (const otherIc of icsInNewColumn) {
      if (order === displayOrder) order++; // Skip the position we're inserting into
      await prisma.user.update({
        where: { id: otherIc.id },
        data: { teamDisplayOrder: order },
      });
      order++;
    }
  }

  // Compact the old column if moving from a different column
  if (oldPositionType && oldPositionType !== positionType) {
    const icsInOldColumn = await prisma.user.findMany({
      where: {
        positionType: oldPositionType,
        icRelationship: { leaderId },
      },
      orderBy: { teamDisplayOrder: 'asc' },
    });

    for (let i = 0; i < icsInOldColumn.length; i++) {
      await prisma.user.update({
        where: { id: icsInOldColumn[i].id },
        data: { teamDisplayOrder: i },
      });
    }
  }

  return true;
}

/**
 * Reorder position type columns
 */
export async function reorderColumns(leaderId: string, columnOrder: string[]): Promise<boolean> {
  // Verify all columns belong to this leader
  const existingColumns = await prisma.positionType.findMany({
    where: { leaderId },
  });

  const existingCodes = new Set(existingColumns.map((c) => c.code));

  for (const code of columnOrder) {
    if (!existingCodes.has(code)) {
      return false;
    }
  }

  // Update display order
  for (let i = 0; i < columnOrder.length; i++) {
    await prisma.positionType.updateMany({
      where: { leaderId, code: columnOrder[i] },
      data: { displayOrder: i },
    });
  }

  return true;
}

/**
 * Create a new position type column
 */
export async function createColumn(
  leaderId: string,
  name: string,
  code: string
): Promise<{ id: string; name: string; code: string; displayOrder: number } | null> {
  // Check if code already exists for this leader
  const existing = await prisma.positionType.findFirst({
    where: { leaderId, code },
  });

  if (existing) {
    return null;
  }

  // Get max display order
  const maxOrder = await prisma.positionType.findFirst({
    where: { leaderId },
    orderBy: { displayOrder: 'desc' },
  });

  const newOrder = (maxOrder?.displayOrder ?? -1) + 1;

  const column = await prisma.positionType.create({
    data: {
      name,
      code,
      displayOrder: newOrder,
      leaderId,
    },
  });

  return {
    id: column.id,
    name: column.name,
    code: column.code,
    displayOrder: column.displayOrder,
  };
}

/**
 * Delete a position type column (moves ICs to unassigned)
 */
export async function deleteColumn(leaderId: string, code: string): Promise<boolean> {
  // Verify column belongs to this leader
  const column = await prisma.positionType.findFirst({
    where: { leaderId, code },
  });

  if (!column) {
    return false;
  }

  // Move all ICs in this column to unassigned
  await prisma.user.updateMany({
    where: {
      positionType: code,
      icRelationship: { leaderId },
    },
    data: {
      positionType: null,
      teamDisplayOrder: null,
    },
  });

  // Delete the column
  await prisma.positionType.delete({
    where: { id: column.id },
  });

  // Compact remaining column orders
  const remainingColumns = await prisma.positionType.findMany({
    where: { leaderId },
    orderBy: { displayOrder: 'asc' },
  });

  for (let i = 0; i < remainingColumns.length; i++) {
    await prisma.positionType.update({
      where: { id: remainingColumns[i].id },
      data: { displayOrder: i },
    });
  }

  return true;
}
