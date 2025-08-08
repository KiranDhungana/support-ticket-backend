# Fix Google Calendar JWT Signature Error

The "Invalid JWT Signature" error indicates that your Google Cloud service account key has expired or been rotated. Here's how to fix it:

## Steps to Regenerate Service Account Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project: `support-ticket-461616`

2. **Navigate to Service Accounts**
   - Go to "IAM & Admin" > "Service Accounts"
   - Find the service account: `calander-api-service@support-ticket-461616.iam.gserviceaccount.com`

3. **Create New Key**
   - Click on the service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON" format
   - Download the new key file

4. **Replace the Key File**
   - Replace the existing `support-ticket-461616-7063b553b6d9.json` file with the new one
   - Or update the `GOOGLE_SERVICE_ACCOUNT_KEY_FILE` environment variable to point to the new file

5. **Verify Calendar Permissions**
   - Ensure the service account has access to the calendar: `c_a2d52150c32515ab5fea7f8371739e16dc72f981eae982fc1c866cb2b7be6fe9@group.calendar.google.com`
   - The service account email needs to be added as a member with "Make changes to events" permission

## Test the Fix

After updating the key, test the endpoints:

```bash
# Test credentials
curl http://localhost:3000/api/calendar/validate-credentials

# Test calendar access
curl http://localhost:3000/api/calendar/test-access

# Get events
curl http://localhost:3000/api/calendar/events
```

## Alternative: Use Environment Variable

You can also set the key file path via environment variable:

```bash
export GOOGLE_SERVICE_ACCOUNT_KEY_FILE=/path/to/your/new-key.json
```

## Common Issues

1. **Key Expired**: Service account keys can expire, especially if they were created with an expiration date
2. **Key Rotated**: If the key was rotated for security reasons
3. **Calendar Permissions**: The service account needs explicit access to the calendar
4. **Project Permissions**: Ensure the service account has the necessary Google Calendar API permissions

## Debugging

The updated code now includes better error handling and debugging endpoints. Check the server logs for more detailed error information.
