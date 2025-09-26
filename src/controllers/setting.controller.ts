import { prisma } from '../lib/prisma';

export const getSettings = async (req: any, res: any) => {
  try {
    const settings = await (prisma as any).setting.findUnique({ where: { id: 'global' } });
    return res.json({ success: true, data: settings || { id: 'global', logoUrl: null } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req: any, res: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Only admins can update settings.' });
  }

  const { logoUrl } = req.body as { logoUrl?: string };
  try {
    const settings = await (prisma as any).setting.upsert({
      where: { id: 'global' },
      create: { id: 'global', logoUrl: logoUrl || null },
      update: { logoUrl: logoUrl ?? null },
    });
    return res.json({ success: true, data: settings, message: 'Settings updated' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update settings' });
  }
};


