import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: "admin@tasknest.com" },
    update: {},
    create: {
      auth0Id: "auth0|admin123",
      email: "admin@tasknest.com",
      name: "Admin User",
      role: "ADMIN",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "john@tasknest.com" },
    update: {},
    create: {
      auth0Id: "auth0|john123",
      email: "john@tasknest.com",
      name: "John Doe",
      role: "EDITOR",
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "jane@tasknest.com" },
    update: {},
    create: {
      auth0Id: "auth0|jane123",
      email: "jane@tasknest.com",
      name: "Jane Smith",
      role: "EDITOR",
    },
  });

  // Create sample board
  const board = await prisma.board.create({
    data: {
      title: "Product Development",
      description: "Main product development board for TaskNest",
      ownerId: user1.id,
      isPublic: false,
    },
  });

  // Add board members
  await prisma.boardMember.createMany({
    data: [
      { boardId: board.id, userId: user2.id, role: "EDITOR" },
      { boardId: board.id, userId: user3.id, role: "VIEWER" },
    ],
  });

  // Create sample labels
  const labels = await prisma.label.createMany({
    data: [
      { name: "Bug", color: "bg-red-500", boardId: board.id },
      { name: "Feature", color: "bg-blue-500", boardId: board.id },
      { name: "Enhancement", color: "bg-green-500", boardId: board.id },
      { name: "Documentation", color: "bg-yellow-500", boardId: board.id },
    ],
  });

  // Create sample lists
  const todoList = await prisma.list.create({
    data: {
      title: "To Do",
      boardId: board.id,
      position: 0,
    },
  });

  const inProgressList = await prisma.list.create({
    data: {
      title: "In Progress",
      boardId: board.id,
      position: 1,
    },
  });

  const reviewList = await prisma.list.create({
    data: {
      title: "Review",
      boardId: board.id,
      position: 2,
    },
  });

  const doneList = await prisma.list.create({
    data: {
      title: "Done",
      boardId: board.id,
      position: 3,
    },
  });

  // Create sample tasks
  const task1 = await prisma.task.create({
    data: {
      title: "Implement user authentication",
      description: "Set up Auth0 integration for user login and registration",
      listId: inProgressList.id,
      position: 0,
      priority: "HIGH",
      createdById: user1.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Design dashboard UI",
      description: "Create wireframes and mockups for the main dashboard",
      listId: todoList.id,
      position: 0,
      priority: "MEDIUM",
      createdById: user1.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: "Set up database schema",
      description: "Create Prisma schema and run initial migrations",
      listId: doneList.id,
      position: 0,
      priority: "HIGH",
      completed: true,
      createdById: user1.id,
    },
  });

  // Assign tasks to users
  await prisma.taskAssignee.createMany({
    data: [
      { taskId: task1.id, userId: user2.id },
      { taskId: task2.id, userId: user3.id },
      { taskId: task3.id, userId: user1.id },
    ],
  });

  // Create sample checklist items
  await prisma.checklistItem.createMany({
    data: [
      {
        title: "Research Auth0 documentation",
        taskId: task1.id,
        position: 0,
        completed: true,
      },
      {
        title: "Set up Auth0 application",
        taskId: task1.id,
        position: 1,
        completed: true,
      },
      {
        title: "Implement login flow",
        taskId: task1.id,
        position: 2,
        completed: false,
      },
      {
        title: "Add logout functionality",
        taskId: task1.id,
        position: 3,
        completed: false,
      },
      {
        title: "Test authentication flow",
        taskId: task1.id,
        position: 4,
        completed: false,
      },
    ],
  });

  // Create sample comments
  await prisma.comment.createMany({
    data: [
      {
        content:
          "Started working on the Auth0 integration. Making good progress!",
        taskId: task1.id,
        userId: user2.id,
      },
      {
        content: "Let me know if you need any help with the UI components.",
        taskId: task2.id,
        userId: user1.id,
      },
    ],
  });

  // Create sample activities
  await prisma.activity.createMany({
    data: [
      {
        type: "BOARD_CREATED",
        data: { boardTitle: board.title },
        boardId: board.id,
        userId: user1.id,
      },
      {
        type: "TASK_CREATED",
        data: { taskTitle: task1.title },
        boardId: board.id,
        taskId: task1.id,
        userId: user1.id,
      },
      {
        type: "TASK_ASSIGNED",
        data: { taskTitle: task1.title, assigneeName: user2.name },
        boardId: board.id,
        taskId: task1.id,
        userId: user1.id,
      },
      {
        type: "TASK_COMPLETED",
        data: { taskTitle: task3.title, completed: true },
        boardId: board.id,
        taskId: task3.id,
        userId: user1.id,
      },
    ],
  });

  // console.log('Database seeded successfully!');
  // console.log(`Created board: ${board.title}`);
  // console.log(`Created ${3} users`);
  // console.log(`Created ${4} lists`);
  // console.log(`Created ${3} tasks`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
