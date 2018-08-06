from flask import Blueprint, redirect, session, request, jsonify, url_for
import google.oauth2.credentials
from dateutil.parser import parse
from datetime import datetime
from google.oauth2 import service_account
import googleapiclient.discovery
import os
import json
from services.create_event import CreateEvent
from services.create_occurrence import CreateOccurrence
from services.update_event import UpdateEvent
from helpers.auth import credentials_to_dict
api = Blueprint('api', __name__) # must be above server import
SERVICE_ACCOUNT_FILE = 'routes/service_account_creds.json'
SCOPES = ["https://www.googleapis.com/auth/calendar"]
CAMPUS_CALENDAR = {
    "carpinteria_ca": "2j33oq03c7msarn4jdi1b4ltb0@group.calendar.google.com",
    "austin_tx": "r3piqbrcuar0g2th7bn3oikirg@group.calendar.google.com",
    "new_york": "kseur7cu8g0tbkbd48u6njhrhs@group.calendar.google.com",
    "portland_or": "nlhmc0r0pgffss5ceppiddof34@group.calendar.google.com",
    "san_diego_ca": "7ebmtjqhjgivgn1p73onqjv7cg@group.calendar.google.com",
    "san_francisco_ca": "lucodivo4jnp98nu2vhpctau7s@group.calendar.google.com",
    "willmar_mn": "rm1n3oc765d3j79e8usp95dcgk@group.calendar.google.com",
    "london_uk": "n8tfmt2o0ii2icr0623o94skg8@group.calendar.google.com",
    "sydney_au": "v55l2kioqei6b5vqq0avbesoa4@group.calendar.google.com",
    "toronto_ca": "ebc69cvhvjhdkpojpe07o5nueo@group.calendar.google.com",
    "vancouver_ca": "tg9e014h4ojucfl6rp6p32b16g@group.calendar.google.com"
}
svc_account_key = os.getenv('SERVICE_ACCOUNT_SECRET').replace(r'\n', '\n')
service_account_info = {
    "type": "service_account",
    "project_id": "procoreactivities-211921",
    "private_key_id": "96d881b40f6ad873425ebcb92c9e0284913b96c9",
    "private_key": svc_account_key,
    "client_email": "mastercalendar@procoreactivities-211921.iam.gserviceaccount.com",
    "client_id": "115297357679202654901",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://accounts.google.com/o/oauth2/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/mastercalendar%40procoreactivities-211921.iam.gserviceaccount.com"
}
credentials = service_account.Credentials.from_service_account_info(
    service_account_info, scopes=SCOPES)
from database import db, User, Schedule, Event, Tag
@api.route('/avatar_url')
def get_avatar_url():
    if 'credentials' not in session or 'avatar_url' not in session:
        return redirect('/auth/authorize')
    return session['avatar_url']

@api.route('/events/new', methods=['POST'])
def create_event():
    if 'credentials' not in session:
        return "unauthorized", 401
    cal = googleapiclient.discovery.build(
        'calendar', 'v3', credentials=credentials)
    req_data = request.get_json()
    calendar_id = CAMPUS_CALENDAR[req_data["campus"]]

    attendees = []
    addToGoogleCal = req_data["googleCalChecked"]
    if addToGoogleCal:
        attendees.append(session["email"])

    events = CreateEvent(req_data, attendees).execute()

    user = find_or_create_user(session["email"], session["name"])
    schedules = []

    for event in events:
        google_event = cal.events().insert(calendarId=calendar_id, body=event).execute()
        schedule = Schedule(google_calendar_id=google_event["id"])
        schedules.append(schedule)

    event = Event(campus=req_data["campus"])
    event.interested_users.append(user)
    event.schedules = schedules

    tags = list(req_data["tags"].keys())
    for t in tags:
        tag = find_or_create_tag(t)
        event.tags.append(tag)
    db.session.add(event)
    db.session.commit()

    return "created", 201

@api.route('/events/leave_event', methods=['POST'])
def leave_event():
    cal = googleapiclient.discovery.build(
            'calendar', 'v3', credentials=credentials)
    req_data = request.get_json()
    event = Event.query.get(req_data["event_id"])
    calendar_id=CAMPUS_CALENDAR[event.campus]
    user = find_or_create_user(session["email"], session["name"])
    if user in event.interested_users:
        event.interested_users.remove(user)
        db.session.add(event)
        db.session.commit()
    for schedule in event.schedules:
        g_event_id = schedule.google_calendar_id
        g_event = cal.events().get(calendarId=calendar_id, eventId=g_event_id).execute()
        if "attendees" in g_event:
            attendees = g_event["attendees"]
            user_as_attendee = next((attendee for attendee in attendees if attendee["email"] == session["email"]), None)
            if user_as_attendee != None:
                attendees.remove(user_as_attendee)
                body = {
                    "attendees": attendees
                }
                cal.events().patch(calendarId=calendar_id, eventId=g_event_id, body=body).execute()
    return "removed", 201

@api.route('/occurrences/new', methods=['POST'])
def create_occurrences():
    if 'credentials' not in session:
        return "unauthorized", 401

    cal = googleapiclient.discovery.build(
        'calendar', 'v3', credentials=credentials)
    req_data = request.get_json()
    calendar_id = CAMPUS_CALENDAR[req_data["campus"]]

    attendees = []
    addToGoogleCal = req_data["googleCalChecked"]
    if addToGoogleCal:
        attendees.append(session["email"])

    new_occurrences = CreateOccurrence(req_data, attendees).execute()
    user = find_or_create_user(session["email"], session["name"])
    event = Event.query.get(req_data["event_id"])
    event.interested_users.append(user)
    schedules = event.schedules

    for o in new_occurrences:
        google_event = cal.events().insert(calendarId=calendar_id, body=o).execute()
        schedule = Schedule(google_calendar_id=google_event["id"])
        schedules.append(schedule)

    event.schedules = schedules
    db.session.add(event)
    db.session.commit()

    return "created", 201

@api.route('/events/update', methods=['POST'])
def update_event():
    if 'credentials' not in session:
        return "unauthorized", 401

    cal = googleapiclient.discovery.build(
        'calendar', 'v3', credentials=credentials)

    req_data = request.get_json()

    events = UpdateEvent(req_data).execute()
    calendar_id = CAMPUS_CALENDAR[req_data["campus"]]

    i = 0
    for event in events:
        event_id = req_data["times"][i]['google_calendar_id']
        cal.events().patch(calendarId=calendar_id, eventId=event_id, body=event).execute()
        i += 1

    for occurrence in req_data["deletedOccurrences"]:
        event_id = occurrence['google_calendar_id']
        s = Schedule.query.get(occurrence["schedule_id"])
        db.session.delete(s)
        cal.events().delete(calendarId=calendar_id, eventId=event_id).execute()

    db.session.commit()

    return "updated", 201

@api.route('/events/delete', methods=['POST'])
def delete_event():
    req_data = request.get_json()
    event_to_delete = Event.query.get(req_data["event_id"])
    google_events_to_delete = []
    cal = googleapiclient.discovery.build(
        'calendar', 'v3', credentials=credentials)

    for schedule in event.schedules:
        google_events_to_delete.append(schedule.google_calendar_id)
        db.session.delete(schedule)

    db.session.delete(event_to_delete)
    campus = CAMPUS_CALENDAR[event.campus]

    for g_event in google_events_to_delete:
        cal.events().delete(calendarId=campus, eventId=g_event).execute()

    db.session.commit()

    return "deleted", 201

@api.route('/events/add_interest', methods=['POST'])
def add_interest_to_event():
    req_data = request.get_json()
    event = Event.query.get(req_data["event_id"])
    user = find_or_create_user(session["email"], session["name"])
    event.interested_users.append(user)
    db.session.add(event)
    db.session.commit()

    google_events_to_add_to = req_data["calendar_ids"]
    cal_id = CAMPUS_CALENDAR[user.home_campus]
    cal = googleapiclient.discovery.build(
        'calendar', 'v3', credentials=credentials)
    for event in google_events_to_add_to:
        event_before_patch = cal.events().get(calendarId=cal_id, eventId=event).execute()
        if "attendees" in event_before_patch:
            attendees = event_before_patch["attendees"]
        else:
            attendees = []
        attendees.append({'email': user.email, "responseStatus": "accepted"})
        body = {
            "attendees": attendees
        }
        cal.events().patch(calendarId=cal_id, eventId=event, body=body).execute()
    return "created", 201
    #event = Event.query.get()

@api.route('/capsule/new', methods=['POST'])
def create_time_capsule():
    if 'credentials' not in session:
        return "unauthorized", 401
    user_credentials = google.oauth2.credentials.Credentials(
        **session['credentials'])
    cal = googleapiclient.discovery.build(
        'calendar', 'v3', credentials=user_credentials)
    req_data = request.get_json()

    events = CreateEvent(req_data).execute()

    user = find_or_create_user(session["email"], session["name"])

    for event in events:
        google_event = cal.events().insert(calendarId='primary', body=event).execute()

    session['credentials'] = credentials_to_dict(user_credentials)
    return "created", 201

@api.route('/events/all')
def get_all_events():
    user = find_or_create_user(session["email"], session["name"])
    if user.home_campus == None:
        return json.dumps(
            {
                "needsCampus": True
            }
        )
    else:
        cal = googleapiclient.discovery.build(
            'calendar', 'v3', credentials=credentials)
        calendar_id = CAMPUS_CALENDAR[user.home_campus]
        events = cal.events().list(calendarId=calendar_id).execute()
        events_list = events["items"]
        interested_fields = ["id", "end", "start", "location", "summary", "description", "recurrence"]
        schedule_fields = ["id", "end", "start", "recurrence"]
        formatted_events = []
        for e in events_list:
            print(e["id"])
            schedule = Schedule.query.filter_by(google_calendar_id=e["id"]).first()
            event = schedule.event
            formatted_event = event_in_formatted_events(formatted_events, event.id)
            if formatted_event == None:
                # Make a new event
                trimmed_event = {}
                tags = []
                for tag in event.tags:
                    tags.append(tag.name)
                trimmed_event["tags"] = tags
                trimmed_event["campus"] = event.campus
                event_time = {}
                for field in interested_fields:
                    if(field == "id"):
                        schedule = Schedule.query.filter_by(google_calendar_id=e[field]).first()
                        event = schedule.event
                        user = User.query.filter_by(email=session["email"]).first()
                        user_interested = event in user.events_interested_in
                        trimmed_event["user_interested"] = user_interested
                        event_time["schedule_id"] = schedule.id
                        event_time["google_calendar_id"] = e["id"]
                        trimmed_event["event_id"] = event.id
                    elif(field == "summary"):
                        trimmed_event["name"] = e["summary"]
                    elif(field == "location"):
                        trimmed_event["location"] = e["location"]
                    elif(field == "description"):
                        trimmed_event["description"] = e["description"]
                    elif(field == "start"):
                        event_time["start"] = e["start"]["dateTime"]
                    elif(field == "end"):
                        event_time["end"] = e["end"]["dateTime"]
                    elif(field == "recurrence"):
                        if "recurrence" in e:
                            event_time["frequency"] = e["recurrence"][0]
                        else:
                            event_time["frequency"] = ""

                trimmed_event["times"] = [event_time]
                if("recurrence" in e):
                    trimmed_event["reccurence"] = e["recurrence"][0]
                    event_time["time_string"] = get_reccurring_time_string(event_time["start"], e["recurrence"][0])
                else:
                    event_time["time_string"] = get_time_string(event_time["start"], event_time["end"])
                formatted_events.append(trimmed_event)
            else:
                event_time = {}
                for field in schedule_fields:
                    if(field == "id"):
                        schedule = Schedule.query.filter_by(google_calendar_id=e[field]).first()
                        event_time["schedule_id"] = schedule.id
                        event_time["google_calendar_id"] = e["id"]
                    elif(field == "end"):
                        event_time["end"] = e["end"]["dateTime"]
                    elif(field == "start"):
                        event_time["start"] = e["start"]["dateTime"]
                    elif(field == "recurrence"):
                        if "recurrence" in e:
                            event_time["frequency"] = e["recurrence"][0]
                        else:
                            event_time["frequency"] = "" 
                if("recurrence" in e):
                    trimmed_event["reccurence"] = e["recurrence"][0]
                    event_time["time_string"] = get_reccurring_time_string(event_time["start"], e["recurrence"][0])
                else:
                    event_time["time_string"] = get_time_string(event_time["start"], event_time["end"])  
                formatted_event["times"].append(event_time)

        return json.dumps(formatted_events), 200
# Should we query events first, then google?
@api.route('/users/update_campus', methods=['POST'])
def update_user_campus():
    req_data = request.get_json()
    user = find_or_create_user(session["email"], session["name"])
    user.home_campus = req_data["campus"]
    db.session.add(user)
    db.session.commit()
    return "created", 201

def find_or_create_user(email, name):
    user = User.query.filter_by(email=email).first()
    return user if user else User(email=email, name=name)

def find_or_create_tag(tagName):
    tag = Tag.query.filter_by(name=tagName).first()
    return tag if tag else Tag(name=tagName)

@api.route('/single_instance_events/id')
def get_events():
    if 'credentials' not in session:
        return "unauthorized", 401
    user_credentials = google.oauth2.credentials.Credentials(
        **session['credentials'])
    cal = googleapiclient.discovery.build(
        'calendar', 'v3', credentials=user_credentials)

    event_id = "3nr1pdqnbhrmv98fq7jl1cjcrs"
    event = cal.events().get(calendarId='primary', eventId=event_id).execute()
    return json.dumps(event), 200

@api.route('/brendan/events')
def get_test_events():
    cal = googleapiclient.discovery.build(
        'calendar', 'v3', credentials=credentials)
    events = cal.events().get(calendarId="r3piqbrcuar0g2th7bn3oikirg@group.calendar.google.com", eventId="iq4f0ege7s3s8oubn6pq85occg").execute()
    return json.dumps(events), 200

def event_in_formatted_events(formatted_events, id):
    for e in formatted_events:
        if e["event_id"] == id:
            return e
def get_reccurring_time_string(start_time, recurrence):
    recurrence_type = recurrence[11:]
    if recurrence_type == "WEEKLY":
        return "Repeats weekly on " + parse(start_time).strftime("%A") + "'s"
    elif recurrence_type == "WEEKLY;INTERVAL=2":
        return "Repeats every other week on " + parse(start_time).strftime("%A") + "'s"
    elif recurrence_type == "DAILY":
        return "Repeats daily at " + parse(start_time).strftime("%-I:%M%p")
    elif recurrence_type == "MONTHLY":
        return "Repeats monthly" #Tech debt, find the number

def get_time_string(start_time, end_time):
    start_date = parse(start_time)
    end_date = parse(end_time)
    time_string = start_date.strftime("%A, %B %d %-I:%M%p -")
    if start_date.date() == end_date.date():
        time_string += end_date.strftime(" %-I:%M%p")
    else:
        time_string += end_date.strftime(" %A, %B %d %-I:% %p")
    return time_string

@api.route('/brendan/new')
def create_recurring_event():
    cal = googleapiclient.discovery.build(
        'calendar', 'v3', credentials=credentials)

    event = {
            'summary': "Trail Running",
            'description': "Some description",
            'location': "Outdoors",
            'start': {
                'dateTime': "2018-08-01T14:00:00-07:00",
                'timeZone': "America/Los_Angeles"
            },
            'end': {
                'dateTime': "2018-08-01T14:30:00-07:00",
                'timeZone': "America/Los_Angeles"
            }
        }
    BRENDAN_TEST_CAL_ID = "r3piqbrcuar0g2th7bn3oikirg@group.calendar.google.com"
    g_event = cal.events().insert(calendarId=BRENDAN_TEST_CAL_ID, body=event).execute()
    test_schedule = Schedule(google_calendar_id=g_event["id"])
    db_event = Event(campus="Carp")
    db_event.schedules.append(test_schedule)
    db.session.add(db_event)
    db.session.commit()
    return "created", 201

@api.route('/brendan/new_cal')
def create_cal():
    cal = googleapiclient.discovery.build(
        'calendar', 'v3', credentials=credentials)
    calendar = {
        'summary': 'calendarSummary',
        'timeZone': 'America/Los_Angeles'
    }
    created_calendar = cal.calendars().insert(body=calendar).execute()
    return json.dumps(created_calendar), 200
