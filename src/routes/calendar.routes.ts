import { Router } from 'express';
import { getEvents, getEventsByDateRange, testCalendarAccess, listAvailableCalendars } from '../controllers/calendar.controller';

const router = Router();

// Get upcoming events (default: next month, max 10 events)
router.get('/events', getEvents);

// Get events by date range
router.get('/events/range', getEventsByDateRange);

// Test calendar access
router.get('/test-access', testCalendarAccess);

// List available calendars
router.get('/calendars', listAvailableCalendars);

export default router; 