import calendarService from '../services/calendarService';

export const getEvents = async (req: any, res: any) => {
  try {
    const { maxResults = 10 } = req.query;
    const events = await calendarService.getEvents(Number(maxResults));
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error in getEvents controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar events'
    });
  }
};

export const getEventsByDateRange = async (req: any, res: any) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const events = await calendarService.getEventsByDateRange(
      startDate as string,
      endDate as string
    );
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error in getEventsByDateRange controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar events'
    });
  }
};

export const testCalendarAccess = async (req: any, res: any) => {
  try {
    const hasAccess = await calendarService.testCalendarAccess();
    
    res.json({
      success: true,
      hasAccess,
      message: hasAccess ? 'Calendar access successful' : 'Calendar access failed'
    });
  } catch (error) {
    console.error('Error in testCalendarAccess controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test calendar access'
    });
  }
};

export const listAvailableCalendars = async (req: any, res: any) => {
  try {
    const calendars = await calendarService.listAvailableCalendars();
    
    res.json({
      success: true,
      data: calendars
    });
  } catch (error) {
    console.error('Error in listAvailableCalendars controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list available calendars'
    });
  }
}; 