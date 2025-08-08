import { Router } from 'express';
import { getEvents, getEventsByDateRange, testCalendarAccess, listAvailableCalendars, validateCredentials, getServiceAccountEmail } from '../controllers/calendar.controller';

const router = Router();

// Get upcoming events (default: next month, max 10 events)
router.get('/events', getEvents);

// Get events by date range
router.get('/events/range', getEventsByDateRange);

// Validate service account credentials
router.get('/validate-credentials', validateCredentials);

// Test calendar access
router.get('/test-access', testCalendarAccess);

// List available calendars
router.get('/calendars', listAvailableCalendars);

// Get service account email (for debugging)
router.get('/service-account-email', getServiceAccountEmail);

export default router; 