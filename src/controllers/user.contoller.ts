import { prisma } from '../lib/prisma';

export const getUsers = async (req: any, res: any) => {
  try {
    const ticket = await prisma.user.findMany();
    if (ticket) {
      return res.status(200).json({ success: false, data: ticket, message: "Users not found." });
    }
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const promoteUserToAdmin = async (req: any, res: any) => {
  const { userId } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: "admin" },
    });

    return res.status(200).json({
      success: true,
      message: "User promoted to admin successfully.",
      data: user,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to promote user.",
    });
  }
};

export const updateUser = async (req: any, res: any) => {
  const { id } = req.params as { id: string };
  const { name, email, role } = req.body as { name?: string; email?: string; role?: string };

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(role !== undefined ? { role } : {}),
      },
    });

    return res.status(200).json({ success: true, data: updatedUser, message: "User updated successfully" });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update user" });
  }
};