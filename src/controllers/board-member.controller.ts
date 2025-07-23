import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllBoardMembers = async (req: Request, res: Response) => {
  try {
    const boardMembers = await prisma.boardMember.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(boardMembers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch board members' });
  }
};

export const getBoardMemberById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const boardMember = await prisma.boardMember.findUnique({
      where: { id }
    });
    
    if (!boardMember) {
      return res.status(404).json({ error: 'Board member not found' });
    }
    
    res.json(boardMember);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch board member' });
  }
};

export const createBoardMember = async (req: Request, res: Response) => {
  try {
    const { name, position, district, email, phone, bio, termStart, termEnd } = req.body;
    
    const boardMember = await prisma.boardMember.create({
      data: {
        name,
        position,
        district,
        email,
        phone,
        bio,
        termStart: termStart ? new Date(termStart) : null,
        termEnd: termEnd ? new Date(termEnd) : null,
      }
    });
    
    res.status(201).json(boardMember);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create board member' });
  }
};

export const updateBoardMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, position, district, email, phone, bio, termStart, termEnd, isActive } = req.body;
    
    const boardMember = await prisma.boardMember.update({
      where: { id },
      data: {
        name,
        position,
        district,
        email,
        phone,
        bio,
        termStart: termStart ? new Date(termStart) : null,
        termEnd: termEnd ? new Date(termEnd) : null,
        isActive,
      }
    });
    
    res.json(boardMember);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update board member' });
  }
};

export const deleteBoardMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.boardMember.update({
      where: { id },
      data: { isActive: false }
    });
    
    res.json({ message: 'Board member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete board member' });
  }
}; 