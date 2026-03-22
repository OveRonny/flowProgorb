import { prisma } from '../prisma/client.js';

const REQUIREMENT_STATUSES = ['OPEN', 'APPROVED', 'IMPLEMENTED', 'REJECTED'];
const RELEASE_CHANNELS = ['DEVELOPMENT', 'RELEASE'];
const RELEASE_STATUSES = ['PLANNED', 'APPROVED', 'RELEASED'];

function normalizeEstimatedHours(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized < 0) {
    const error = new Error('estimatedHours must be a number greater than or equal to 0');
    error.status = 400;
    throw error;
  }

  return normalized;
}

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

async function ensureVersionBelongsToProject(projectId, versionId) {
  if (versionId == null || versionId === '') {
    return null;
  }

  const normalizedVersionId = Number(versionId);
  const version = await prisma.releaseVersion.findFirst({
    where: {
      id: normalizedVersionId,
      projectId
    },
    select: { id: true }
  });

  if (!version) {
    throw new Error('Release version not found for this project');
  }

  return normalizedVersionId;
}

async function requireVersionBelongsToProject(projectId, versionId) {
  const normalizedVersionId = await ensureVersionBelongsToProject(projectId, versionId);

  if (!normalizedVersionId) {
    const error = new Error('Requirement must be assigned to a release version');
    error.status = 400;
    throw error;
  }

  return normalizedVersionId;
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
    },
    targetVersion: {
      select: {
        id: true,
        versionTag: true,
        name: true,
        channel: true,
        status: true,
        releaseDate: true
      }
    }
  };
}

async function loadRequirementDetails(projectId, requirementId) {
  const requirement = await prisma.requirement.findFirst({
    where: {
      id: requirementId,
      projectId
    }
  });

  if (!requirement) {
    return null;
  }

  const meeting = requirement.meetingId
    ? await prisma.customerMeeting.findFirst({
      where: {
        id: requirement.meetingId,
        projectId
      },
      select: {
        id: true,
        title: true,
        date: true
      }
    })
    : null;

  const features = await prisma.feature.findMany({
    where: {
      projectId,
      requirementId
    },
    select: {
      id: true,
      name: true,
      status: true
    }
  });

  const targetVersion = requirement.targetVersionId
    ? await prisma.releaseVersion.findFirst({
      where: {
        id: requirement.targetVersionId,
        projectId
      },
      select: {
        id: true,
        versionTag: true,
        name: true,
        channel: true,
        status: true,
        releaseDate: true
      }
    })
    : null;

  return {
    ...requirement,
    meeting,
    features,
    targetVersion
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
        status: true,
        estimatedHours: true
      }
    }
  };
}

function projectEmailSelect() {
  return {
    id: true,
    subject: true,
    sender: true,
    recipients: true,
    summary: true,
    sentAt: true,
    createdAt: true,
    updatedAt: true
  };
}

function releaseVersionSelect() {
  return {
    id: true,
    versionTag: true,
    name: true,
    channel: true,
    status: true,
    releaseDate: true,
    createdAt: true,
    updatedAt: true
  };
}

export async function listProjectVersionsService(projectId, userId) {
  if (!(await ensureProjectAccess(projectId, userId))) {
    return null;
  }

  return prisma.releaseVersion.findMany({
    where: { projectId },
    orderBy: [
      { createdAt: 'desc' }
    ],
    select: releaseVersionSelect()
  });
}

export async function createProjectVersionService(projectId, data, userId) {
  if (!(await ensureProjectAccess(projectId, userId))) {
    return null;
  }

  const versionTag = String(data?.versionTag || '').trim();
  if (!versionTag) {
    throw new Error('versionTag is required');
  }

  const channel = data?.channel || 'DEVELOPMENT';
  if (!RELEASE_CHANNELS.includes(channel)) {
    throw new Error(`Invalid release channel: ${channel}`);
  }

  const status = data?.status || 'PLANNED';
  if (!RELEASE_STATUSES.includes(status)) {
    throw new Error(`Invalid release status: ${status}`);
  }

  return prisma.releaseVersion.create({
    data: {
      projectId,
      versionTag,
      name: data?.name?.trim() || null,
      channel,
      status,
      releaseDate: data?.releaseDate ? new Date(data.releaseDate) : null
    },
    select: releaseVersionSelect()
  });
}

export async function updateProjectVersionService(projectId, versionId, data, userId) {
  if (!(await ensureProjectAccess(projectId, userId))) {
    return null;
  }

  const existingVersion = await prisma.releaseVersion.findFirst({
    where: {
      id: versionId,
      projectId
    },
    select: { id: true }
  });

  if (!existingVersion) {
    return null;
  }

  if (data.channel && !RELEASE_CHANNELS.includes(data.channel)) {
    throw new Error(`Invalid release channel: ${data.channel}`);
  }

  if (data.status && !RELEASE_STATUSES.includes(data.status)) {
    throw new Error(`Invalid release status: ${data.status}`);
  }

  return prisma.releaseVersion.update({
    where: { id: versionId },
    data: {
      versionTag: data.versionTag === undefined ? undefined : String(data.versionTag).trim(),
      name: data.name === undefined ? undefined : (String(data.name || '').trim() || null),
      channel: data.channel,
      status: data.status,
      releaseDate: data.releaseDate === undefined ? undefined : (data.releaseDate ? new Date(data.releaseDate) : null)
    },
    select: releaseVersionSelect()
  });
}

export async function deleteProjectVersionService(projectId, versionId, userId) {
  if (!(await ensureProjectAccess(projectId, userId))) {
    return { count: 0 };
  }

  const linkedRequirements = await prisma.requirement.count({
    where: {
      projectId,
      targetVersionId: versionId
    }
  });

  if (linkedRequirements > 0) {
    const error = new Error('Cannot delete a version that is used by requirements');
    error.status = 400;
    throw error;
  }

  return prisma.releaseVersion.deleteMany({
    where: {
      id: versionId,
      projectId
    }
  });
}

export async function createRequirementService(projectId, data, userId) {
  if (!(await ensureProjectAccess(projectId, userId))) {
    return null;
  }

  if (data.status && !REQUIREMENT_STATUSES.includes(data.status)) {
    throw new Error(`Invalid requirement status: ${data.status}`);
  }

  const meetingId = await ensureMeetingBelongsToProject(projectId, data.meetingId);
  const targetVersionId = await requireVersionBelongsToProject(projectId, data.targetVersionId);

  const createdRequirement = await prisma.requirement.create({
    data: {
      projectId,
      title: data.title,
      description: data.description ?? null,
      priority: data.priority != null && data.priority !== '' ? Number(data.priority) : null,
      estimatedHours: normalizeEstimatedHours(data.estimatedHours) ?? null,
      status: data.status ?? 'OPEN',
      meetingId,
      targetVersionId
    },
    select: { id: true }
  });

  return loadRequirementDetails(projectId, createdRequirement.id);
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
    select: { id: true, status: true, targetVersionId: true, features: { select: { id: true } } }
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

  const targetVersionId = data.targetVersionId === undefined
    ? existingRequirement.targetVersionId
    : await requireVersionBelongsToProject(projectId, data.targetVersionId);

  if (!targetVersionId) {
    const error = new Error('Requirement must be assigned to a release version');
    error.status = 400;
    throw error;
  }

  const updatedRequirement = await prisma.requirement.update({
    where: { id: requirementId },
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority === undefined
        ? undefined
        : data.priority === null || data.priority === ''
          ? null
          : Number(data.priority),
      estimatedHours: normalizeEstimatedHours(data.estimatedHours),
      status: data.status,
      meetingId: data.meetingId === undefined ? undefined : meetingId,
      targetVersionId: data.targetVersionId === undefined ? undefined : targetVersionId
    },
    select: { id: true }
  });

  // Automatically create a feature when requirement is approved
  if (data.status === 'APPROVED' && existingRequirement.features.length === 0) {
    try {
      // Find or create a "General" module for this project
      let module = await prisma.module.findFirst({
        where: {
          projectId,
          name: 'General'
        }
      });

      if (!module) {
        module = await prisma.module.create({
          data: {
            projectId,
            name: 'General',
            description: 'Default module for approved requirements'
          }
        });
      }

      // Create a feature from the approved requirement
      const requirementData = await prisma.requirement.findUnique({
        where: { id: requirementId }
      });

      if (requirementData) {
        await prisma.feature.create({
          data: {
            projectId,
            moduleId: module.id,
            name: requirementData.title,
            description: requirementData.description,
            requirementId,
            status: 'PLANNED'
          }
        });
      }
    } catch (error) {
      // Log error but don't fail the requirement update
      console.error('Error creating feature from approved requirement:', error);
    }
  }

  return loadRequirementDetails(projectId, updatedRequirement.id);
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

export async function createProjectEmailService(projectId, data, userId) {
  if (!(await ensureProjectAccess(projectId, userId))) {
    return null;
  }

  return prisma.projectEmail.create({
    data: {
      projectId,
      subject: String(data.subject || '').trim(),
      sender: data.sender ? String(data.sender).trim() : null,
      recipients: Array.isArray(data.recipients)
        ? data.recipients.map((entry) => String(entry).trim()).filter(Boolean)
        : [],
      summary: data.summary ? String(data.summary).trim() : null,
      sentAt: data.sentAt ? new Date(data.sentAt) : new Date()
    },
    select: projectEmailSelect()
  });
}

export async function updateProjectEmailService(projectId, emailId, data, userId) {
  if (!(await ensureProjectAccess(projectId, userId))) {
    return null;
  }

  const existingEmail = await prisma.projectEmail.findFirst({
    where: {
      id: emailId,
      projectId
    },
    select: { id: true }
  });

  if (!existingEmail) {
    return null;
  }

  return prisma.projectEmail.update({
    where: { id: emailId },
    data: {
      subject: data.subject === undefined ? undefined : String(data.subject || '').trim(),
      sender: data.sender === undefined ? undefined : (data.sender ? String(data.sender).trim() : null),
      recipients: data.recipients === undefined
        ? undefined
        : (Array.isArray(data.recipients)
          ? data.recipients.map((entry) => String(entry).trim()).filter(Boolean)
          : []),
      summary: data.summary === undefined ? undefined : (data.summary ? String(data.summary).trim() : null),
      sentAt: data.sentAt === undefined ? undefined : (data.sentAt ? new Date(data.sentAt) : null)
    },
    select: projectEmailSelect()
  });
}

export async function deleteProjectEmailService(projectId, emailId, userId) {
  if (!(await ensureProjectAccess(projectId, userId))) {
    return { count: 0 };
  }

  return prisma.projectEmail.deleteMany({
    where: {
      id: emailId,
      projectId
    }
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

  const where = {
    id: projectId,
    members: {
      some: {
        userId
      }
    }
  };

  const project = await prisma.project.findFirst({ where });

  if (!project) {
    return null;
  }

  // Run related planning queries sequentially to avoid concurrent queries on a single pg client.
  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          githubLogin: true
        }
      }
    }
  });

  const requirements = await prisma.requirement.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    include: requirementInclude()
  });

  const versions = await prisma.releaseVersion.findMany({
    where: { projectId },
    orderBy: [
      { createdAt: 'desc' }
    ],
    select: releaseVersionSelect()
  });

  const milestones = await prisma.milestone.findMany({
    where: { projectId },
    orderBy: [
      { completed: 'asc' },
      { dueDate: 'asc' }
    ]
  });

  const customerMeetings = await prisma.customerMeeting.findMany({
    where: { projectId },
    orderBy: { date: 'desc' },
    include: customerMeetingInclude()
  });

  const emails = await prisma.projectEmail.findMany({
    where: { projectId },
    orderBy: { sentAt: 'desc' },
    select: projectEmailSelect()
  });

  return {
    ...project,
    members,
    requirements,
    versions,
    milestones,
    customerMeetings,
    emails
  };
}