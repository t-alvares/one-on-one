import { PrismaClient } from '@prisma/client';
import { addWeeks, subWeeks, setHours, setMinutes } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding realistic data for Milena Okabe...');

  // Find users
  const milena = await prisma.user.findFirst({ where: { email: 'mokabe@wawanesa.com' } });
  const tarsio = await prisma.user.findFirst({ where: { email: 'talvares@wawanesa.com' } });

  if (!milena || !tarsio) {
    throw new Error('Users not found. Run main seed first.');
  }

  // Find labels
  const labels = await prisma.label.findMany();
  const careerLabel = labels.find(l => l.name === 'Career');
  const developmentLabel = labels.find(l => l.name === 'Development');
  const feedbackLabel = labels.find(l => l.name === 'Feedback');
  const projectsLabel = labels.find(l => l.name === 'Projects');
  const personalLabel = labels.find(l => l.name === 'Personal');

  // Find relationship
  const relationship = await prisma.relationship.findFirst({
    where: { leaderId: tarsio.id, icId: milena.id }
  });

  if (!relationship) {
    throw new Error('Relationship not found between Tarsio and Milena');
  }

  // Delete existing data for Milena
  console.log('🗑️  Deleting existing data for Milena...');

  // Delete meeting topics and notes for meetings in this relationship
  const existingMeetings = await prisma.meeting.findMany({
    where: { relationshipId: relationship.id }
  });

  for (const meeting of existingMeetings) {
    await prisma.meetingNote.deleteMany({ where: { meetingId: meeting.id } });
    await prisma.meetingTopic.deleteMany({ where: { meetingId: meeting.id } });
  }

  await prisma.meeting.deleteMany({ where: { relationshipId: relationship.id } });

  // Delete Milena's thoughts and topics
  await prisma.thought.deleteMany({ where: { userId: milena.id } });
  await prisma.topic.deleteMany({ where: { userId: milena.id } });

  // Delete Tarsio's thoughts and topics ABOUT Milena
  await prisma.thought.deleteMany({ where: { userId: tarsio.id, aboutIcId: milena.id } });
  await prisma.topic.deleteMany({ where: { userId: tarsio.id, aboutIcId: milena.id } });

  console.log('✓ Deleted existing data');

  // ============================================
  // MILENA'S THOUGHTS (IC's private thoughts)
  // No content - only titles
  // ============================================
  console.log('📝 Creating Milena\'s thoughts...');

  await prisma.thought.createMany({
    data: [
      {
        userId: milena.id,
        title: 'Want to learn more about AWS architecture',
        labelId: developmentLabel?.id,
        order: 0,
      },
      {
        userId: milena.id,
        title: 'Feeling overwhelmed with the Guidewire deadline',
        labelId: projectsLabel?.id,
        order: 1,
      },
      {
        userId: milena.id,
        title: 'Interested in the Tech Lead role that opened up',
        labelId: careerLabel?.id,
        order: 2,
      },
      {
        userId: milena.id,
        title: 'Great feedback from the business on the automation script',
        labelId: feedbackLabel?.id,
        order: 3,
      },
      {
        userId: milena.id,
        title: 'Need to improve my presentation skills',
        labelId: developmentLabel?.id,
        order: 4,
      },
    ]
  });

  // ============================================
  // MILENA'S TOPICS (IC's backlog for 1:1s)
  // No content - only titles
  // ============================================
  console.log('📋 Creating Milena\'s topics...');

  await prisma.topic.createMany({
    data: [
      {
        userId: milena.id,
        title: 'Discuss career path to Senior Solutions Architect',
        labelId: careerLabel?.id,
        status: 'BACKLOG',
      },
      {
        userId: milena.id,
        title: 'Request for AWS certification sponsorship',
        labelId: developmentLabel?.id,
        status: 'BACKLOG',
      },
      {
        userId: milena.id,
        title: 'Workload concerns - Guidewire + BAU support',
        labelId: projectsLabel?.id,
        status: 'BACKLOG',
      },
      {
        userId: milena.id,
        title: 'Interest in mentoring new team members',
        labelId: careerLabel?.id,
        status: 'BACKLOG',
      },
    ]
  });

  // ============================================
  // TARSIO'S THOUGHTS ABOUT MILENA (Leader's private notes)
  // No content - only titles
  // ============================================
  console.log('📝 Creating Tarsio\'s thoughts about Milena...');

  await prisma.thought.createMany({
    data: [
      {
        userId: tarsio.id,
        aboutIcId: milena.id,
        title: 'Strong technical growth this quarter',
        labelId: feedbackLabel?.id,
        order: 0,
      },
      {
        userId: tarsio.id,
        aboutIcId: milena.id,
        title: 'May need support with stakeholder communication',
        labelId: developmentLabel?.id,
        order: 1,
      },
      {
        userId: tarsio.id,
        aboutIcId: milena.id,
        title: 'Positive feedback from Claims team',
        labelId: feedbackLabel?.id,
        order: 2,
      },
      {
        userId: tarsio.id,
        aboutIcId: milena.id,
        title: 'Consider for AWS training budget',
        labelId: developmentLabel?.id,
        order: 3,
      },
      {
        userId: tarsio.id,
        aboutIcId: milena.id,
        title: 'Watch for burnout signs',
        labelId: personalLabel?.id,
        order: 4,
      },
    ]
  });

  // ============================================
  // TARSIO'S TOPICS ABOUT MILENA (Leader's backlog)
  // No content - only titles
  // ============================================
  console.log('📋 Creating Tarsio\'s topics about Milena...');

  await prisma.topic.createMany({
    data: [
      {
        userId: tarsio.id,
        aboutIcId: milena.id,
        title: 'Mid-year performance review discussion',
        labelId: feedbackLabel?.id,
        status: 'BACKLOG',
      },
      {
        userId: tarsio.id,
        aboutIcId: milena.id,
        title: 'Cloud migration project role assignment',
        labelId: projectsLabel?.id,
        status: 'BACKLOG',
      },
      {
        userId: tarsio.id,
        aboutIcId: milena.id,
        title: 'Leadership development opportunities',
        labelId: careerLabel?.id,
        status: 'BACKLOG',
      },
      {
        userId: tarsio.id,
        aboutIcId: milena.id,
        title: 'Recognition for automation initiative',
        labelId: feedbackLabel?.id,
        status: 'BACKLOG',
      },
    ]
  });

  // ============================================
  // MEETINGS (Past and Upcoming)
  // ============================================
  console.log('📅 Creating meetings...');

  const now = new Date();
  const meetingTime = setMinutes(setHours(now, 10), 0); // 10:00 AM

  // Past meetings (3 in the past)
  const pastMeeting1 = await prisma.meeting.create({
    data: {
      relationshipId: relationship.id,
      createdById: tarsio.id,
      scheduledAt: subWeeks(meetingTime, 3),
      title: '1:1 with Milena Okabe',
      status: 'COMPLETED',
    }
  });

  const pastMeeting2 = await prisma.meeting.create({
    data: {
      relationshipId: relationship.id,
      createdById: tarsio.id,
      scheduledAt: subWeeks(meetingTime, 2),
      title: '1:1 with Milena Okabe',
      status: 'COMPLETED',
    }
  });

  const pastMeeting3 = await prisma.meeting.create({
    data: {
      relationshipId: relationship.id,
      createdById: tarsio.id,
      scheduledAt: subWeeks(meetingTime, 1),
      title: '1:1 with Milena Okabe',
      status: 'COMPLETED',
    }
  });

  // Future meetings (4 upcoming)
  const futureMeeting1 = await prisma.meeting.create({
    data: {
      relationshipId: relationship.id,
      createdById: tarsio.id,
      scheduledAt: addWeeks(meetingTime, 1),
      title: '1:1 with Milena Okabe',
      status: 'SCHEDULED',
    }
  });

  await prisma.meeting.createMany({
    data: [
      {
        relationshipId: relationship.id,
        createdById: tarsio.id,
        scheduledAt: addWeeks(meetingTime, 2),
        title: '1:1 with Milena Okabe',
        status: 'SCHEDULED',
      },
      {
        relationshipId: relationship.id,
        createdById: tarsio.id,
        scheduledAt: addWeeks(meetingTime, 3),
        title: '1:1 with Milena Okabe',
        status: 'SCHEDULED',
      },
      {
        relationshipId: relationship.id,
        createdById: tarsio.id,
        scheduledAt: addWeeks(meetingTime, 4),
        title: '1:1 with Milena Okabe',
        status: 'SCHEDULED',
      },
    ]
  });

  // ============================================
  // DISCUSSED TOPICS (attached to past meetings)
  // No content - only titles
  // ============================================
  console.log('📎 Creating discussed topics...');

  // Topics that were discussed in past meetings
  const discussedTopic1 = await prisma.topic.create({
    data: {
      userId: milena.id,
      title: 'Q1 goals alignment',
      labelId: careerLabel?.id,
      status: 'DISCUSSED',
    }
  });

  const discussedTopic2 = await prisma.topic.create({
    data: {
      userId: tarsio.id,
      aboutIcId: milena.id,
      title: 'Project handoff from departing team member',
      labelId: projectsLabel?.id,
      status: 'DISCUSSED',
    }
  });

  const discussedTopic3 = await prisma.topic.create({
    data: {
      userId: milena.id,
      title: 'Flexible work arrangement request',
      labelId: personalLabel?.id,
      status: 'DISCUSSED',
    }
  });

  // Attach discussed topics to past meetings
  await prisma.meetingTopic.create({
    data: {
      meetingId: pastMeeting1.id,
      topicId: discussedTopic1.id,
      addedById: milena.id,
      resolution: 'DONE',
      order: 0,
    }
  });

  await prisma.meetingTopic.create({
    data: {
      meetingId: pastMeeting2.id,
      topicId: discussedTopic2.id,
      addedById: tarsio.id,
      resolution: 'DONE',
      order: 0,
    }
  });

  await prisma.meetingTopic.create({
    data: {
      meetingId: pastMeeting3.id,
      topicId: discussedTopic3.id,
      addedById: milena.id,
      resolution: 'DONE',
      order: 0,
    }
  });

  // ============================================
  // SCHEDULED TOPICS (attached to upcoming meeting)
  // No content - only titles
  // ============================================
  console.log('📎 Creating scheduled topics...');

  // Add some topics to the next meeting
  const scheduledTopic1 = await prisma.topic.create({
    data: {
      userId: milena.id,
      title: 'AWS certification timeline',
      labelId: developmentLabel?.id,
      status: 'SCHEDULED',
    }
  });

  const scheduledTopic2 = await prisma.topic.create({
    data: {
      userId: tarsio.id,
      aboutIcId: milena.id,
      title: 'Cloud migration team lead proposal',
      labelId: projectsLabel?.id,
      status: 'SCHEDULED',
    }
  });

  await prisma.meetingTopic.create({
    data: {
      meetingId: futureMeeting1.id,
      topicId: scheduledTopic1.id,
      addedById: milena.id,
      order: 0,
    }
  });

  await prisma.meetingTopic.create({
    data: {
      meetingId: futureMeeting1.id,
      topicId: scheduledTopic2.id,
      addedById: tarsio.id,
      order: 1,
    }
  });

  console.log('\n✅ Realistic data seeded successfully for Milena Okabe!');
  console.log('\n📊 Summary:');
  console.log('   - 5 thoughts for Milena (IC)');
  console.log('   - 4 backlog topics for Milena (IC)');
  console.log('   - 5 thoughts for Tarsio about Milena (Leader)');
  console.log('   - 4 backlog topics for Tarsio about Milena (Leader)');
  console.log('   - 3 past meetings (completed)');
  console.log('   - 4 upcoming meetings (scheduled)');
  console.log('   - 3 discussed topics');
  console.log('   - 2 scheduled topics for next meeting');
  console.log('   - No content fields set (titles only)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
