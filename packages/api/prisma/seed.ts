import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.progressUpdate.deleteMany();
  await prisma.action.deleteMany();
  await prisma.meetingNote.deleteMany();
  await prisma.meetingTopic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.thought.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.positionType.deleteMany();
  await prisma.fileUpload.deleteMany();
  await prisma.user.deleteMany();
  await prisma.label.deleteMany();
  await prisma.competency.deleteMany();

  console.log('✓ Cleaned existing data');

  // Hash passwords
  const hashedPasswordAdmin = await bcrypt.hash('password123', 10);
  const hashedPasswordWawanesa = await bcrypt.hash('123456', 10);

  // Create Labels
  const labels = await Promise.all([
    prisma.label.create({
      data: { name: 'Career', color: '#9065B0' },
    }),
    prisma.label.create({
      data: { name: 'Development', color: '#2383E2' },
    }),
    prisma.label.create({
      data: { name: 'Feedback', color: '#0F7B6C' },
    }),
    prisma.label.create({
      data: { name: 'Projects', color: '#DFAB01' },
    }),
    prisma.label.create({
      data: { name: 'Personal', color: '#E03E3E' },
    }),
  ]);

  console.log('✓ Created labels:', labels.map((l) => l.name).join(', '));

  // Create Competencies
  const competencies = await Promise.all([
    prisma.competency.create({
      data: {
        name: 'Communication',
        description: 'Effectively conveys information and ideas through various channels',
        order: 1,
      },
    }),
    prisma.competency.create({
      data: {
        name: 'Problem Solving',
        description: 'Analyzes issues and develops effective solutions',
        order: 2,
      },
    }),
    prisma.competency.create({
      data: {
        name: 'Collaboration',
        description: 'Works effectively with others to achieve shared goals',
        order: 3,
      },
    }),
    prisma.competency.create({
      data: {
        name: 'Leadership',
        description: 'Guides and inspires others towards achieving objectives',
        order: 4,
      },
    }),
    prisma.competency.create({
      data: {
        name: 'Technical Excellence',
        description: 'Demonstrates deep expertise and continuous learning in technical domain',
        order: 5,
      },
    }),
    prisma.competency.create({
      data: {
        name: 'Customer Focus',
        description: 'Prioritizes customer needs and delivers value',
        order: 6,
      },
    }),
  ]);

  console.log('✓ Created competencies:', competencies.map((c) => c.name).join(', '));

  // Create Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@company.com',
      password: hashedPasswordAdmin,
      name: 'System Admin',
      role: 'ADMIN',
      isAdmin: true,
      isActive: true,
    },
  });

  console.log('✓ Created admin:', admin.email);

  // Create Wawanesa Leader
  const talvares = await prisma.user.create({
    data: {
      email: 'talvares@wawanesa.com',
      password: hashedPasswordWawanesa,
      name: 'Tarsio Alvares',
      role: 'LEADER',
      isAdmin: true,
      isActive: true,
      position: 'Supervisor, Application Delivery',
    },
  });

  console.log('✓ Created leader:', talvares.name);

  // Create Position Types for Tarsio's team
  await prisma.positionType.create({
    data: {
      name: 'Solutions Analysts',
      code: 'SOLUTIONS_ANALYST',
      displayOrder: 0,
      leaderId: talvares.id,
    },
  });

  await prisma.positionType.create({
    data: {
      name: 'Developers',
      code: 'DEVELOPER',
      displayOrder: 1,
      leaderId: talvares.id,
    },
  });

  await prisma.positionType.create({
    data: {
      name: 'System Administrators',
      code: 'SYSTEM_ADMIN',
      displayOrder: 2,
      leaderId: talvares.id,
    },
  });

  console.log('✓ Created position types: Solutions Analysts, Developers, System Administrators');

  // Create Wawanesa ICs
  const mokabe = await prisma.user.create({
    data: {
      email: 'mokabe@wawanesa.com',
      password: hashedPasswordWawanesa,
      name: 'Milena Okabe',
      role: 'IC',
      isActive: true,
      position: 'Senior Solutions Analyst',
      positionType: 'SOLUTIONS_ANALYST',
      teamDisplayOrder: 0,
      yearsOfService: 2.0,
      timeInPosition: 1.0,
    },
  });

  const acustodio = await prisma.user.create({
    data: {
      email: 'acustodio@wawanesa.com',
      password: hashedPasswordWawanesa,
      name: 'Arnel Custodio',
      role: 'IC',
      isActive: true,
      position: 'Senior Developer',
      positionType: 'DEVELOPER',
      teamDisplayOrder: 0,
      yearsOfService: 3.0,
      timeInPosition: 2.0,
    },
  });

  const gford = await prisma.user.create({
    data: {
      email: 'gford@wawanesa.com',
      password: hashedPasswordWawanesa,
      name: 'Geoff Ford',
      role: 'IC',
      isActive: true,
      position: 'Senior Systems Administrator',
      positionType: 'SYSTEM_ADMIN',
      teamDisplayOrder: 0,
      yearsOfService: 5.0,
      timeInPosition: 3.0,
    },
  });

  const jvillanueva = await prisma.user.create({
    data: {
      email: 'jvillanueva@wawanesa.com',
      password: hashedPasswordWawanesa,
      name: 'Jaru Villanueva',
      role: 'IC',
      isActive: true,
      position: 'Solutions Analyst II',
      positionType: 'SOLUTIONS_ANALYST',
      teamDisplayOrder: 1,
    },
  });

  const rkaur = await prisma.user.create({
    data: {
      email: 'rkaur@wawanesa.com',
      password: hashedPasswordWawanesa,
      name: 'Rukmandeep Kaur',
      role: 'IC',
      isActive: true,
      position: 'Application Developer II',
      positionType: 'DEVELOPER',
      teamDisplayOrder: 1,
    },
  });

  console.log('✓ Created ICs:', mokabe.name, ',', acustodio.name, ',', gford.name, ',', jvillanueva.name, ',', rkaur.name);

  // Create Relationships: Tarsio -> all 5 ICs
  await prisma.relationship.create({
    data: {
      leaderId: talvares.id,
      icId: mokabe.id,
    },
  });

  await prisma.relationship.create({
    data: {
      leaderId: talvares.id,
      icId: acustodio.id,
    },
  });

  await prisma.relationship.create({
    data: {
      leaderId: talvares.id,
      icId: gford.id,
    },
  });

  await prisma.relationship.create({
    data: {
      leaderId: talvares.id,
      icId: jvillanueva.id,
    },
  });

  await prisma.relationship.create({
    data: {
      leaderId: talvares.id,
      icId: rkaur.id,
    },
  });

  console.log('✓ Created 5 leader-IC relationships');

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📋 Test accounts:');
  console.log('   Admin: admin@company.com / password123');
  console.log('   Leader: talvares@wawanesa.com / 123456');
  console.log('   IC 1: mokabe@wawanesa.com / 123456');
  console.log('   IC 2: acustodio@wawanesa.com / 123456');
  console.log('   IC 3: gford@wawanesa.com / 123456');
  console.log('   IC 4: jvillanueva@wawanesa.com / 123456');
  console.log('   IC 5: rkaur@wawanesa.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
