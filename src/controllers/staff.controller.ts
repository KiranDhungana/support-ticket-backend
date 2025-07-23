import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all staff members
export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', department = '' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { position: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (department) {
      where.department = department;
    }

    const [staff, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { name: 'asc' }
      }),
      prisma.staff.count({ where })
    ]);

    res.json({
      data: staff,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff members' });
  }
};

// Get staff member by ID
export const getStaffById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const staff = await prisma.staff.findUnique({
      where: { id }
    });

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ error: 'Failed to fetch staff member' });
  }
};

// Create new staff member
export const createStaff = async (req: Request, res: Response) => {
  try {
    const {
      name,
      position,
      department,
      email,
      phone,
      location,
      experience,
      imageUrl,
      bio
    } = req.body;

    // Validate required fields
    if (!name || !position || !department || !email) {
      return res.status(400).json({ 
        error: 'Name, position, department, and email are required' 
      });
    }

    // Check if email already exists
    const existingStaff = await prisma.staff.findFirst({
      where: { email }
    });

    if (existingStaff) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const staff = await prisma.staff.create({
      data: {
        name,
        position,
        department,
        email,
        phone: phone || null,
        location: location || null,
        experience: experience ? parseInt(experience) : null,
        imageUrl: imageUrl || null,
        bio: bio || null
      }
    });

    res.status(201).json(staff);
  } catch (error) {
    console.error('Error creating staff member:', error);
    res.status(500).json({ error: 'Failed to create staff member' });
  }
};

// Update staff member
export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      position,
      department,
      email,
      phone,
      location,
      experience,
      imageUrl,
      bio
    } = req.body;

    // Check if staff member exists
    const existingStaff = await prisma.staff.findUnique({
      where: { id }
    });

    if (!existingStaff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== existingStaff.email) {
      const emailExists = await prisma.staff.findFirst({
        where: { 
          email,
          id: { not: id }
        }
      });

      if (emailExists) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    const staff = await prisma.staff.update({
      where: { id },
      data: {
        name: name || undefined,
        position: position || undefined,
        department: department || undefined,
        email: email || undefined,
        phone: phone !== undefined ? phone : undefined,
        location: location !== undefined ? location : undefined,
        experience: experience ? parseInt(experience) : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        bio: bio !== undefined ? bio : undefined
      }
    });

    res.json(staff);
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ error: 'Failed to update staff member' });
  }
};

// Delete staff member
export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if staff member exists
    const existingStaff = await prisma.staff.findUnique({
      where: { id }
    });

    if (!existingStaff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    await prisma.staff.delete({
      where: { id }
    });

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
};

// Get departments
export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.staff.findMany({
      select: { department: true },
      distinct: ['department']
    });

    const departmentList = departments
      .map(d => d.department)
      .filter(Boolean)
      .sort();

    res.json(departmentList);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
}; 