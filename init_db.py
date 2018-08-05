from server import *
import google.oauth2.credentials
from google.oauth2 import service_account
import googleapiclient.discovery
import os

db.drop_all()
db.create_all()

def user_ian():
    return User(name='Ian Lumiere', email='ian.lumiere@procore.com')

def user_hannah():
    return User(name='Hannah Terry', email='hannah.terry@procore.com')

def user_mina():
    return User(name='Mina Rhee', email='mina.rhee@procore.com')

def user_brendan():
    return User(name='Brendan Jones', email='brendan.jones@procore.com')

def event():
    return Event(campus='san_francisco_ca')

def schedule(google_event):
    return Schedule(google_calendar_id=google_event["id"])

def soccer_event():
     return {
            'summary': "Soccer",
            'description': "Bring cleats.",
            'location': "Field north of P3",
            'start': {
                'dateTime': "2018-08-02T13:30:00-07:00",
                'timeZone': "America/Los_Angeles"
            },
            'end': {
                'dateTime': "2018-08-02T14:30:00-07:00",
                'timeZone': "America/Los_Angeles"
            },
            'recurring':  ["RRULE:FREQ=WEEKLY"]
        }

def soccer_event2():
     return {
            'summary': "Soccer",
            'description': "Bring cleats.",
            'location': "Field north of P3",
            'start': {
                'dateTime': "2018-08-04T13:30:00-07:00",
                'timeZone': "America/Los_Angeles"
            },
            'end': {
                'dateTime': "2018-08-04T14:30:00-07:00",
                'timeZone': "America/Los_Angeles"
            },
            'recurring':  ["RRULE:FREQ=WEEKLY"]
        }

def yoga_event():
    return {
            'summary': "Yoga",
            'description': "Free yoga class every week!",
            'location': "P3 Yoga Studio",
            'start': {
                'dateTime': "2018-08-02T13:30:00-07:00",
                'timeZone': "America/Los_Angeles"
            },
            'end': {
                'dateTime': "2018-08-02T14:30:00-07:00",
                'timeZone': "America/Los_Angeles"
            },
            'recurring':  ["RRULE:FREQ=WEEKLY"]
        }

def ballcore_event():
    return {
            'summary': "Ballcore",
            'description': "Play basketball every week with other Procorians. $80 fee is split among all attendees (usually around less than $5 per person.",
            'location': "Basketball gym at Cate School",
            'start': {
                'dateTime': "2018-08-08T17:30:00-07:00",
                'timeZone': "America/Los_Angeles"
            },
            'end': {
                'dateTime': "2018-08-08T19:00:00-07:00",
                'timeZone': "America/Los_Angeles"
            },
            'recurring':  ["RRULE:FREQ=WEEKLY"]
        }

def trailrun_event():
    return {
            'summary': "Trail Running",
            'description': "Come trail run with others in Malibu Canyon. All speeds are welcome!",
            'location': "Malibu Canyon",
            'start': {
                'dateTime': "2018-08-09T09:30:00-07:00",
                'timeZone': "America/Los_Angeles"
            },
            'end': {
                'dateTime': "2018-08-09T11:00:00-07:00",
                'timeZone': "America/Los_Angeles"
            },
            'recurring':  ["RRULE:FREQ=MONTHLY"]
        }

def send_google_event(event_data):
    SERVICE_ACCOUNT_FILE = os.path.dirname(__file__) + 'routes/service_account_creds.json'
    SCOPES = ["https://www.googleapis.com/auth/calendar"]
    TEST_CAL_ID = 'lucodivo4jnp98nu2vhpctau7s@group.calendar.google.com'
    credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    cal = googleapiclient.discovery.build(
        'calendar', 'v3', credentials=credentials)
    return cal.events().insert(calendarId=TEST_CAL_ID, body=event_data).execute()


user = user_ian()
user2 = user_hannah()
user3 = user_mina()
user4 = user_brendan()

ballcore = event()
ballcore_schedule = schedule(send_google_event(ballcore_event()))
ballcore.schedules.append(ballcore_schedule)
ballcore.interested_users.append(user)

yoga = event()
yoga_schedule = schedule(send_google_event(yoga_event()))
yoga.schedules.append(yoga_schedule)
yoga.interested_users.append(user)
yoga.interested_users.append(user2)
yoga.interested_users.append(user3)

soccer = event()
soccer_schedule_1 = schedule(send_google_event(soccer_event()))
soccer_schedule_2 = schedule(send_google_event(soccer_event2()))
soccer.schedules.append(soccer_schedule_1)
soccer.schedules.append(soccer_schedule_2)
soccer.interested_users.append(user)
soccer.interested_users.append(user4)

trailrun = event()
trailrun_schedule = schedule(send_google_event(trailrun_event()))
trailrun.schedules.append(trailrun_schedule)
trailrun.interested_users.append(user2)
trailrun.interested_users.append(user4)

db.session.add(ballcore)
db.session.add(yoga)
db.session.add(soccer)
db.session.add(trailrun)
db.session.commit()

# Unable to find server =(, I think you have to have server running to post google events
