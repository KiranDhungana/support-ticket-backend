import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import path from 'path';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
}

class CalendarService {
  private calendar: any;
  private calendarId: string;

  constructor() {
    // Get the absolute path to the service account key file
    const keyFilePath = path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || '');
    
    console.log('Service account key file path:', keyFilePath);
    console.log('Calendar ID:', process.env.GOOGLE_CALENDAR_ID);
    
    // Initialize with your service account credentials
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    this.calendar = google.calendar({ version: 'v3', auth });
    this.calendarId = process.env.GOOGLE_CALENDAR_ID || 'c_a2d52150c32515ab5fea7f8371739e16dc72f981eae982fc1c866cb2b7be6fe9@group.calendar.google.com';
  }

  async getEvents(maxResults: number = 10): Promise<CalendarEvent[]> {
    try {
      const now = new Date();
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

      console.log('Attempting to fetch events from calendar:', this.calendarId);
      console.log('Time range:', now.toISOString(), 'to', oneMonthFromNow.toISOString());

      const response = await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin: now.toISOString(),
        timeMax: oneMonthFromNow.toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      console.log('Successfully fetched events:', response.data.items?.length || 0, 'events');
      return response.data.items || [];
    } catch (error: any) {
      console.error('Error fetching calendar events:', error);
      console.error('Error details:', {
        code: error.code,
        status: error.status,
        message: error.message,
        calendarId: this.calendarId
      });
      
      if (error.code === 404) {
        throw new Error(`Calendar not found or access denied. Calendar ID: ${this.calendarId}`);
      }
      
      throw new Error(`Failed to fetch calendar events: ${error.message}`);
    }
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin: startDate,
        timeMax: endDate,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error: any) {
      console.error('Error fetching calendar events:', error);
      throw new Error(`Failed to fetch calendar events: ${error.message}`);
    }
  }

  async listAvailableCalendars(): Promise<any[]> {
    try {
      const response = await this.calendar.calendarList.list();
      return response.data.items || [];
    } catch (error: any) {
      console.error('Error listing calendars:', error);
      throw new Error(`Failed to list calendars: ${error.message}`);
    }
  }

  async testCalendarAccess(): Promise<boolean> {
    try {
      const response = await this.calendar.calendars.get({
        calendarId: this.calendarId
      });
      console.log('Calendar access test successful:', response.data.summary);
      return true;
    } catch (error: any) {
      console.error('Calendar access test failed:', error);
      return false;
    }
  }
}

export default new CalendarService(); 