# Google Calendar Setup Guide

This guide will help you set up Google Calendar access for the support ticket application.

## Prerequisites

1. Google Cloud Project with Calendar API enabled
2. Service account with Calendar API permissions
3. Google Calendar that you want to access

## Current Configuration

- **Service Account Email**: `calander@support-ticket-461616.iam.gserviceaccount.com`
- **Calendar ID**: `c_a2d52150c32515ab5fea7f8371739e16dc72f981eae982fc1c866cb2b7be6fe9@group.calendar.google.com`
- **Service Account Key File**: `support-ticket-461616-2fb818dc8a93.json`

## Common Issues and Solutions

### 1. "Invalid grant: account not found" Error

This error occurs when the service account doesn't have access to the calendar.

**Solution:**
1. Go to [Google Calendar](https://calendar.google.com)
2. Find the calendar with ID: `c_a2d52150c32515ab5fea7f8371739e16dc72f981eae982fc1c866cb2b7be6fe9@group.calendar.google.com`
3. Click on the three dots next to the calendar name
4. Select "Settings and sharing"
5. Scroll down to "Share with specific people"
6. Click "Add people"
7. Add this service account email: `calander@support-ticket-461616.iam.gserviceaccount.com`
8. Give it "Make changes to events" permission
9. Click "Send"

### 2. "Invalid JWT Signature" Error

This error occurs when the service account key is invalid or expired.

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "IAM & Admin" > "Service Accounts"
3. Find the service account: `calander@support-ticket-461616.iam.gserviceaccount.com`
4. Click on the service account
5. Go to "Keys" tab
6. Click "Add Key" > "Create new key"
7. Choose "JSON" format
8. Download the new key file
9. Replace the existing `support-ticket-461616-2fb818dc8a93.json` file with the new one

### 3. "Calendar not found" Error

This error occurs when the calendar ID is incorrect or the calendar doesn't exist.

**Solution:**
1. Verify the calendar ID is correct
2. Ensure the calendar exists and is accessible
3. Check if the calendar is shared with the service account

## Testing the Setup

Use these endpoints to test your calendar setup:

### 1. Test Service Account Email
```bash
curl http://localhost:5000/api/calendar/service-account-email
```

### 2. Validate Credentials
```bash
curl http://localhost:5000/api/calendar/validate-credentials
```

### 3. Test Calendar Access
```bash
curl http://localhost:5000/api/calendar/test-access
```

### 4. Get Events
```bash
curl http://localhost:5000/api/calendar/events
```

## Environment Variables

You can configure the following environment variables:

- `GOOGLE_SERVICE_ACCOUNT_KEY_FILE`: Path to the service account key file
- `GOOGLE_CALENDAR_ID`: Calendar ID to access

Example:
```bash
export GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./path/to/your/key.json
export GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
```

## Troubleshooting

### Check Service Account Permissions
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "IAM & Admin" > "Service Accounts"
3. Find your service account
4. Ensure it has the following roles:
   - Calendar API User
   - Service Account Token Creator

### Check Calendar API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "APIs & Services" > "Library"
3. Search for "Google Calendar API"
4. Ensure it's enabled for your project

### Check Calendar Sharing
1. Go to [Google Calendar](https://calendar.google.com)
2. Find your calendar
3. Click on the three dots next to the calendar name
4. Select "Settings and sharing"
5. Scroll down to "Share with specific people"
6. Ensure the service account email is listed with appropriate permissions

## Support

If you continue to have issues, please check:
1. The service account key file is valid and not expired
2. The calendar ID is correct
3. The service account has access to the calendar
4. The Google Calendar API is enabled in your project
