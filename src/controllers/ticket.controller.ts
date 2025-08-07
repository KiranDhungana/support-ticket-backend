import { prisma } from '../lib/prisma';

export const createTicket = async (req: any, res: any) => {
  const { name, email, phone, location, availableTime, subject, description } = req.body;
  const userId = req.user.id;

  try {
    const ticket = await prisma.supportTicket.create({
      data: { name, email, phone, location, availableTime, subject, description, userId },
    });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully.",
      data: ticket,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create ticket.",
    });
  }
};
export const getTickets = async (req: any, res: any) => {
  if (req.user.role === "admin") {
    const tickets = await prisma.supportTicket.findMany();
    res.json(tickets);
  } else {
    const userId = req.user.id;
    console.log(req.user, "the user id");
    const tickets = await prisma.supportTicket.findMany({
      where: {
        userId: userId,
      },
    });
    res.json(tickets);
  }
};

export const getTicketById = async (req: any, res: any) => {
  const userId = req.user.id;
  const { id } = req.params;
  const ticket = await prisma.supportTicket.findFirst({ where: { id, userId } });

  if (!ticket) return res.status(404).json({ message: "Ticket not found." });

  res.json(ticket);
};

export const updateTicket = async (req: any, res: any) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { name, email, phone, location, availableTime, subject, description } = req.body;

  try {
    const ticket = await prisma.supportTicket.updateMany({
      where: { id, userId },
      data: { name, email, phone, location, availableTime, subject, description },
    });

    if (ticket.count === 0) return res.status(404).json({ message: "Ticket not found or unauthorized." });

    res.json({ message: "Ticket updated successfully." });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTicket = async (req: any, res: any) => {
  const userId = req.user.id;

  const { id } = req.params;

  const deleted = await prisma.supportTicket.deleteMany({ where: { id } });

  if (deleted.count === 0) return res.status(404).json({ message: "Ticket not found or unauthorized." });

  res.json({ message: "Ticket deleted successfully." });
};
export const updateTicketStatus = async (req: any, res: any) => {
  const { id } = req.params;

  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Only admins can update ticket status." });
  }

  try {
    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    const newStatus = ticket.status === 1 ? 0 : 1;

    const updatedTicket = await prisma.supportTicket.update({
      where: { id },
      data: { status: newStatus },
    });

    res.json({ success: true, message: "Ticket status updated successfully.", data: updatedTicket });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getDashboardStats = async (req: any, res: any) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Only admins can access dashboard stats." });
  }

  try {
    // Get current date boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all tickets for total counts
    const allTickets = await prisma.supportTicket.findMany();
    
    // Get today's tickets
    const todayTickets = await prisma.supportTicket.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Calculate statistics
    const totalTickets = allTickets.length;
    const openTickets = allTickets.filter(ticket => ticket.status === 1).length;
    const closedTickets = allTickets.filter(ticket => ticket.status === 0).length;
    const resolutionRate = totalTickets > 0 ? Math.round((closedTickets / totalTickets) * 100) : 0;

    // Today's statistics
    const newTicketsToday = todayTickets.length;
    const resolvedToday = todayTickets.filter(ticket => ticket.status === 0).length;
    const activeTicketsToday = todayTickets.filter(ticket => ticket.status === 1).length;

    // Get recent tickets for the table (last 10)
    const recentTickets = await prisma.supportTicket.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            picture: true
          }
        }
      }
    });

    // Get tickets by status for trend analysis
    const ticketsByStatus = await prisma.supportTicket.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    // Get tickets by date for the last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last7Days.push(date);
    }

    const dailyStats = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayTickets = await prisma.supportTicket.findMany({
          where: {
            createdAt: {
              gte: date,
              lt: nextDay
            }
          }
        });

        return {
          date: date.toISOString().split('T')[0],
          total: dayTickets.length,
          open: dayTickets.filter(t => t.status === 1).length,
          closed: dayTickets.filter(t => t.status === 0).length
        };
      })
    );

    const dashboardStats = {
      overview: {
        totalTickets,
        openTickets,
        closedTickets,
        resolutionRate
      },
      today: {
        newTickets: newTicketsToday,
        resolvedTickets: resolvedToday,
        activeTickets: activeTicketsToday
      },
      recentTickets,
      dailyStats,
      ticketsByStatus
    };

    res.json({
      success: true,
      data: dashboardStats
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch dashboard statistics." 
    });
  }
};
