import prisma from '../lib/prisma';
import { ApiError } from '../middleware/errorHandler';

/**
 * Label Service
 * Handles label operations (admin only for create/update/delete)
 */

/**
 * List all labels
 */
export async function listLabels() {
  const labels = await prisma.label.findMany({
    orderBy: { name: 'asc' },
  });

  return labels;
}

/**
 * Get label by ID
 */
export async function getLabelById(labelId: string) {
  const label = await prisma.label.findUnique({
    where: { id: labelId },
  });

  if (!label) {
    throw ApiError.notFound('Label');
  }

  return label;
}

/**
 * Create a label (admin only)
 */
export async function createLabel(data: { name: string; color: string }) {
  const existing = await prisma.label.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    throw ApiError.validation('Label name already exists');
  }

  const label = await prisma.label.create({
    data: {
      name: data.name,
      color: data.color,
    },
  });

  return label;
}

/**
 * Update a label (admin only)
 */
export async function updateLabel(
  labelId: string,
  data: { name?: string; color?: string }
) {
  const label = await prisma.label.findUnique({
    where: { id: labelId },
  });

  if (!label) {
    throw ApiError.notFound('Label');
  }

  if (data.name && data.name !== label.name) {
    const existing = await prisma.label.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw ApiError.validation('Label name already exists');
    }
  }

  const updated = await prisma.label.update({
    where: { id: labelId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.color && { color: data.color }),
    },
  });

  return updated;
}

/**
 * Delete a label (admin only)
 * Checks if label is in use before deletion
 */
export async function deleteLabel(labelId: string, force = false) {
  const label = await prisma.label.findUnique({
    where: { id: labelId },
    include: {
      _count: {
        select: {
          thoughts: true,
          topics: true,
        },
      },
    },
  });

  if (!label) {
    throw ApiError.notFound('Label');
  }

  const usageCount = label._count.thoughts + label._count.topics;

  if (usageCount > 0 && !force) {
    throw ApiError.validation(
      `Cannot delete label "${label.name}" because it is used by ${label._count.thoughts} thought(s) and ${label._count.topics} topic(s). Use force=true to delete anyway.`
    );
  }

  // If force delete, first remove the label from all thoughts and topics
  if (usageCount > 0 && force) {
    await prisma.$transaction([
      prisma.thought.updateMany({
        where: { labelId },
        data: { labelId: null },
      }),
      prisma.topic.updateMany({
        where: { labelId },
        data: { labelId: null },
      }),
      prisma.label.delete({
        where: { id: labelId },
      }),
    ]);
  } else {
    await prisma.label.delete({
      where: { id: labelId },
    });
  }
}

/**
 * List all competencies
 */
export async function listCompetencies() {
  const competencies = await prisma.competency.findMany({
    orderBy: { order: 'asc' },
  });

  return competencies;
}

/**
 * Create a competency (admin only)
 */
export async function createCompetency(data: { name: string; description?: string }) {
  // Get max order
  const maxOrder = await prisma.competency.aggregate({
    _max: { order: true },
  });

  const competency = await prisma.competency.create({
    data: {
      name: data.name,
      description: data.description,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  return competency;
}

/**
 * Update a competency (admin only)
 */
export async function updateCompetency(
  competencyId: string,
  data: { name?: string; description?: string }
) {
  const competency = await prisma.competency.findUnique({
    where: { id: competencyId },
  });

  if (!competency) {
    throw ApiError.notFound('Competency');
  }

  const updated = await prisma.competency.update({
    where: { id: competencyId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });

  return updated;
}

/**
 * Reorder competencies (admin only)
 */
export async function reorderCompetencies(order: string[]) {
  // Update each competency's order
  await Promise.all(
    order.map((id, index) =>
      prisma.competency.update({
        where: { id },
        data: { order: index },
      })
    )
  );
}

/**
 * Delete a competency (admin only)
 */
export async function deleteCompetency(competencyId: string) {
  const competency = await prisma.competency.findUnique({
    where: { id: competencyId },
  });

  if (!competency) {
    throw ApiError.notFound('Competency');
  }

  await prisma.competency.delete({
    where: { id: competencyId },
  });
}
