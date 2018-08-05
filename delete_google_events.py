from server import *
import google.oauth2.credentials
from google.oauth2 import service_account
import googleapiclient.discovery
from routes.api import CAMPUS_CALENDAR
import sys

SERVICE_ACCOUNT_FILE = 'routes/service_account_creds.json'
SCOPES = ["https://www.googleapis.com/auth/calendar"]

credentials = service_account.Credentials.from_service_account_file(
  SERVICE_ACCOUNT_FILE, scopes=SCOPES)
cal = googleapiclient.discovery.build(
  'calendar', 'v3', credentials=credentials)

def delete_all_google_calendar_events():
    for calendar_id in CAMPUS_CALENDAR.values():
        events = cal.events().list(calendarId=calendar_id).execute()
        for e in events["items"]:
            cal.events().delete(calendarId=calendar_id, eventId=e["id"]).execute()

def delete_all_events_from_single_calendar(calendar_key):
    calendar_id = CAMPUS_CALENDAR[calendar_key]
    events = cal.events().list(calendarId=calendar_id).execute()
    for e in events["items"]:
        cal.events().delete(calendarId=calendar_id, eventId=e["id"]).execute()

if len(sys.argv) <= 1:
    print("Please specify which calendar you want to delete events from")
    print("Example usage: python delete_google_events.py [all|carpinteria_ca|austin_tx|new_york|...]")
else:
    delete_type = sys.argv[1]
    if delete_type == "all":
        delete_all_google_calendar_events()
    elif delete_type not in CAMPUS_CALENDAR.keys():
        print("Calendar " + delete_type + " not regognized.")
    else:
        delete_all_events_from_single_calendar(delete_type)
