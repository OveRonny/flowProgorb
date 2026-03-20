import { prisma } from '../prisma/client.js';

const REQUIREMENT_STATUSES = ['OPEN', 'APPROVED', 'IMPLEMENTED', 'REJECTED'];

async function userHasProjectAccess(projectId, userId) {
  if (!userId) {
    return false;
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId
      }
    },
    select: { id: true }
  });

  return Boolean(membership);
}

async function ensureProjectAccess(projectId, userId) {
  if (!(await userHasProjectAccess(projectId, userId))) {
    return false;
  }

  return true;
}

async function ensureMeetingBelongsToProject(projectId, meetingId) {
  if (meetingId == null) {
    return null;
  }

  const normalizedMeetingId = Number(meetingId);
  const meeting = await prisma.customerMeeting.findFirst({
    where: {
      id: normalizedMeetingId,
      projectId
    },
    select: { id: true }
  });

  if (!meeting) {
    throw new Error('Customer meeting not found for this project');
  }

  return normalizedMeetingId;
}

async function ensureRequirementBelongsToProject(projectId, requirementId) {
  if (requirementId == null || requirementId === '') {
    return null;
  }

  const normalizedRequirementId = Number(requirementId);
  const requirement = await prisma.requirement.findFirst({
    where: {
      id: normalizedRequirementId,
      projectId
    },
    select: { id: true }
  });

  if (!requirement) {
    throw new Error('Requirement not found for this project');
  }

  return normalizedRequirementId;
}

async function normalizeAttendeeIds(projectId, attendeeIds) {
  if (!Array.isArray(attendeeIds)) {
    return [];
  }

  const normalizedIds = attendeeIds
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (normalizedIds.length === 0) {
    return [];
  }

  const memberships = await prisma.projectMember.findMany({
    where: {
      projectId,
      userId: {
        in: normalizedIds
      }
    },
    select: { userId: true }
  });

  const allowedIds = memberships.map((membership) => membership.userId);

  if (allowedIds.length !== normalizedIds.length) {
    throw new Error('One or more attendees are not members of this project');
  }

  return allowedIds;
}

function requirementInclude() {
  return {
    meeting: {
      select: {
        id: true,
        title: true,
        date: true
      }
    },
    features: {
      select: {
        id: true,
        name: true,
        status: true
      }
    }
  };
}

function milestoneSelect() {
  return {
    id: true,
    title: true,
    description: true,
    dueDate: true,
    completed: true,
    orderIndex: true,
    createdAt: true,
    updatedAt: true
  };
}

function customerMeetingInclude() {
  return {
    attendees: {
      select: {
        id: true,
        email: true,
        githubLogin: true
      }
    },
    requirements: {
      select: {
        id: true,
        title: true,
        status: true
      }
    }
  };
}

export async function createRequirementService(projectId, data, userId) {
  if (!(await ensureProjectAccess(projectId, userId))) {
    return null;
  }

  if (data.status && !REQUIREMENT_STATUSES.includes(data.status)) {
    throw new Error(`Invalid requirement status: ${data.status}`);
  }

  const meetingId = await ensureMeetingBelongsToProject(projectId, data.meetingId);

  return prisma.requirement.create({
    data: {
      projectId,
      title: data.title,
      description: data.description ?? null,
      priority: data.priority != null && data.priority !== '' ? Number(data.priority) : null,
      status: data.status ?? 'OPEN',
      meetingId
    },
    include: requirementInclude()
  });
}

export async function updateRequirementService(projectId, requirementId, data, userId) {
  if (!(await ensureProjectAccess(projectId, userId))) {
    return null;
  }

  const existingRequirement = await prisma.requirement.findFirst({
    where: {
      id: requirementId,
      projectId
    },
    select: { id: true }
  });

  if (!existingRequirement) {
    return null;
  }

  if (data.status && !REQUIREMENT_STATUSES.includes(data.status)) {
    throw new Error(`Invalid requirement status: ${data.status}`);
  }

  const meetingId = data.meetingId === undefined
    ? undefined
    : await ensureMeetingBelongsToProject(projectId, data.meetingId);

  return prisma.requirement.update({
    where: { id: requirementId },
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority === undefined
        ? undefined
        : data.priority === null || data.priority === ''
          ? null
          : Number(data.priority),
      status: data.status,
      meetingId: data.meetingId === undefined ? undefined : meetingId
    },
    include: requirementInclude()
  });
}

export async function deleteRequirementService(projectId, requirementId, userId) {
  if (!(await ensureProjectAccess(projectId, userId))) {
    return { count: 0 };
  }

  await prisma.feature.updateMany({
    where: {
      projectId,
      requirementId
    },
    data: {
      requirementId: null
    }
  });

  return prisma.requirement.deleteMany({
    where: {
      id: requirementId,
      projectId
    }
  });
}

export async function createMilestoneService(projectId, data, userId) {
  if (!(await ensureProjectAccess(projectId, userId))) {
    return null;
  }

  return prisma.milestone.create({
    data: {
      projectId,
      title: data.title,
      description: data.description ?? null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      completed: Boolean(data.completed),
      orderIndex: data.orderIndex != null && data.orderIndex !== '' ? Number(data.orderIndex) : null
    },
    select: milestoneSelect()
  });
}

export async function updateMilestoneService(projectId, milestoneId, data, userId) {
  if (!(await ensureProjectAccess(projectId, userId))) {
    return null;
  }

  const existingMilestone = await prisma.milestone.findFirst({
    where: {
      id: milestoneId,
      projectId
    },
    select: { id: true }
  });

  if (!existingMilestone) {
    return null;
  }

  return prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate === undefined ? undefined : data.dueDate ? new Date(data.dueDate) : null,
      completed: data.completed,
      orderIndex: data.orderIndex === undefined
        ? undefined
        : data.orderIndex === null || data.orderIndex === ''
          ? null
          : Number(data.orderIndex)
    },
    select: milestoneSelect()
  });
}

export async function deleteMilestoneService(projectId, milestoneId, userId) {
  if (!(await ensureProjectAccess(projectId, userId))) {
    return { count: 0 };
  }

  return prisma.milestone.deleteMany({
    where: {
      id: milestoneId,
      projectId
    }
  });
}

export async function createCustomerMeetingService(projectId, data, userId) {
  if (!(await ensureProjectAccess(projectId, userId))) {
    return null;
  }

  const attendeeIds = await normalizeAttendeeIds(projectId, data.attendeeIds);

  return prisma.customerMeeting.create({
    data: {
      projectId,
      title: data.title,
      notes: data.notes ?? null,
      date: data.date ? new Date(data.date) : new Date(),
      attendees: attendeeIds.length > 0
        ? {
          connect: attendeeIds.map((id) => ({ id }))
        }
        : undefined
    },
    include: customerMeetingInclude()
  });
}

export async function updateCustomerMeetingService(projectId, meetingId, data, userId) {
  if (!(await ensureProjectAccess(projectId, userId))) {
    return null;
  }

  const existingMeeting = await prisma.customerMeeting.findFirst({
    where: {
      id: meetingId,
      projectId
    },
    select: { id: true }
  });

  if (!existingMeeting) {
    return null;
  }

  const attendeeIds = data.attendeeIds === undefined
    ? undefined
    : await normalizeAttendeeIds(projectId, data.attendeeIds);

  return prisma.customerMeeting.update({
    where: { id: meetingId },
    data: {
      title: data.title,
      notes: data.notes,
      date: data.date === undefined ? undefined : data.date ? new Date(data.date) : null,
      attendees: attendeeIds === undefined
        ? undefined
        : {
          set: attendeeIds.map((id) => ({ id }))
        }
    },
    include: customerMeetingInclude()
  });
}

export async function deleteCustomerMeetingService(projectId, meetingId, userId) {
  if (!(await ensureProjectAccess(projectId, userId))) {
    return { count: 0 };
  }

  await prisma.requirement.updateMany({
    where: {
      projectId,
      meetingId
    },
    data: {
      meetingId: null
    }
  });

  return prisma.customerMeeting.deleteMany({
    where: {
      id: meetingId,
      projectId
    }
  });
}

export async function getProjectPlanningService(projectId, userId) {
  if (!(await ensureProjectAccess(projectId, userId))) {
    return null;
  }

  return prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: {
          userId
        }
      }
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              githubLogin: true
            }
          }
        }
      },
      requirements: {
        orderBy: { createdAt: 'desc' },
        include: requirementInclude()
      },
      milestones: {
        orderBy: [
          { completed: 'asc' },
          { dueDate: 'asc' }
        ]
      },
      customerMeetings: {
        orderBy: { date: 'desc' },
        include: customerMeetingInclude()
      }
    }
  });
}