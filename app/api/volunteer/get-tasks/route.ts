import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { skills } = await request.json();
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return NextResponse.json({ tasks: [] });
  }
  // Find tasks where requiredSkills overlap with volunteer's skills
  const tasks = await prisma.task.findMany({
    where: {
      status: "PENDING",
      OR: skills.map(skill => ({
        requiredSkills: {
          contains: skill
        }
      }))
    }
  });
  // Parse requiredSkills from JSON string
  const parsedTasks = tasks.map(task => ({
    ...task,
    requiredSkills: task.requiredSkills ? JSON.parse(task.requiredSkills) : []
  }));
  return NextResponse.json({ tasks: parsedTasks });
}
