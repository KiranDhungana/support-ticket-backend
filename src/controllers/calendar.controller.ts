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
      message: 'Failed to fetch calendar events',
      error: error instanceof Error ? error.message : 'Unknown error'
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
      message: 'Failed to fetch calendar events',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const validateCredentials = async (req: any, res: any) => {
  try {
    const isValid = await calendarService.validateCredentials();
    
    res.json({
      success: true,
      isValid,
      message: isValid ? 'Service account credentials are valid' : 'Service account credentials are invalid'
    });
  } catch (error) {
    console.error('Error in validateCredentials controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate credentials',
      error: error instanceof Error ? error.message : 'Unknown error'
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
      message: 'Failed to test calendar access',
      error: error instanceof Error ? error.message : 'Unknown error'
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
      message: 'Failed to list available calendars',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 

export const getServiceAccountEmail = async (req: any, res: any) => {
  try {
    const email = calendarService.getServiceAccountEmail();
    
    res.json({
      success: true,
      serviceAccountEmail: email,
      message: 'Service account email retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getServiceAccountEmail controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service account email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 