import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import path from 'path';
import fs from 'fs';

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
  private auth: any;
  private serviceAccountEmail: string;

  constructor() {
    // Get the absolute path to the service account key file
    const keyFilePath = path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || './support-ticket-461616-2fb818dc8a93.json');
    
    console.log('Service account key file path:', keyFilePath);
    console.log('Calendar ID:', process.env.GOOGLE_CALENDAR_ID);
    
    // Check if the key file exists
    if (!fs.existsSync(keyFilePath)) {
      throw new Error(`Service account key file not found: ${keyFilePath}`);
    }
    
    try {
      // Read and validate the service account key
      const keyFileContent = fs.readFileSync(keyFilePath, 'utf8');
      const keyData = JSON.parse(keyFileContent);
      
      if (!keyData.private_key || !keyData.client_email) {
        throw new Error('Invalid service account key file: missing required fields');
      }
      
      this.serviceAccountEmail = keyData.client_email;
      console.log('Service account email:', this.serviceAccountEmail);
      
      // Initialize with your service account credentials
      this.auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
      });

      this.calendar = google.calendar({ version: 'v3', auth: this.auth });
      this.calendarId = process.env.GOOGLE_CALENDAR_ID || 'c_a2d52150c32515ab5fea7f8371739e16dc72f981eae982fc1c866cb2b7be6fe9@group.calendar.google.com';
    } catch (error) {
      console.error('Error initializing Google Calendar service:', error);
      throw new Error(`Failed to initialize calendar service: ${error}`);
    }
  }

  getServiceAccountEmail(): string {
    return this.serviceAccountEmail;
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const client = await this.auth.getClient();
      const projectId = await this.auth.getProjectId();
      console.log('Successfully authenticated with project:', projectId);
      return true;
    } catch (error: any) {
      console.error('Credential validation failed:', error);
      return false;
    }
  }

  async getEvents(maxResults: number = 10): Promise<CalendarEvent[]> {
    try {
      // First validate credentials
      const isValid = await this.validateCredentials();
      if (!isValid) {
        throw new Error('Invalid service account credentials. Please check your Google Cloud service account key.');
      }

      // Test calendar access before trying to fetch events
      const hasAccess = await this.testCalendarAccess();
      if (!hasAccess) {
        const errorMessage = `Service account does not have access to calendar: ${this.calendarId}. 
        
To fix this issue:
1. Go to Google Calendar (https://calendar.google.com)
2. Find the calendar with ID: ${this.calendarId}
3. Click on the three dots next to the calendar name
4. Select "Settings and sharing"
5. Scroll down to "Share with specific people"
6. Click "Add people"
7. Add this service account email: ${this.serviceAccountEmail}
8. Give it "Make changes to events" permission
9. Click "Send"`;
        
        throw new Error(errorMessage);
      }

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
        calendarId: this.calendarId,
        serviceAccountEmail: this.serviceAccountEmail
      });
      
      // Handle specific JWT signature errors
      if (error.message && error.message.includes('Invalid JWT Signature')) {
        throw new Error('Service account credentials are invalid or expired. Please regenerate your Google Cloud service account key.');
      }
      
      if (error.code === 404) {
        throw new Error(`Calendar not found. Please verify the calendar ID: ${this.calendarId}`);
      }
      
      if (error.code === 403) {
        throw new Error(`Access denied to calendar. Please ensure the service account (${this.serviceAccountEmail}) has access to calendar: ${this.calendarId}`);
      }

      // Handle invalid_grant error
      if (error.message && error.message.includes('invalid_grant')) {
        const errorMessage = `Invalid grant error. This usually means the service account doesn't have access to the calendar. 
        
To fix this:
1. Go to Google Calendar (https://calendar.google.com)
2. Find the calendar with ID: ${this.calendarId}
3. Click on the three dots next to the calendar name
4. Select "Settings and sharing"
5. Scroll down to "Share with specific people"
6. Click "Add people"
7. Add this service account email: ${this.serviceAccountEmail}
8. Give it "Make changes to events" permission
9. Click "Send"`;
        
        throw new Error(errorMessage);
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
      console.error('Calendar access test details:', {
        code: error.code,
        status: error.status,
        message: error.message,
        calendarId: this.calendarId,
        serviceAccountEmail: this.serviceAccountEmail
      });
      return false;
    }
  }
}

export default new CalendarService(); 