class CreateEvent(object):
    def __init__(self, req_data, invitees=[], recurriung=False):
        self.req_data = req_data
        self.invitees = invitees

    def timeZone(self, campus):
        if campus == 'carpinteria_ca':
            return 'America/Los_Angeles'
        elif campus == 'austin_tx':
            return 'America/Chicago'
        elif campus == 'new_york':
            return 'America/New_York'
        elif campus == 'portland_or':
            return 'America/Los_Angeles'
        elif campus == 'san_diego_ca':
            return 'America/Los_Angeles'
        elif campus == 'san_francisco_ca':
            return 'America/Los_Angeles'
        elif campus == 'willmar_mn':
            return 'America/Chicago'
        elif campus == 'london_uk':
            return 'Europe/London'
        elif campus == 'sydney_au':
            return 'Australia/Sydney'
        elif campus == 'toronto_ca':
            return 'America/Toronto'
        elif campus == 'vancouver_ca':
            return 'America/Vancouver'
        else:
            return 'America/Los_Angeles'

    def getEventInfo(self, frequency, date, start_time, end_time):
        timeZone = self.timeZone(self.req_data["campus"])

        event = {
            'summary': self.req_data["title"],
            'description': self.req_data["description"],
            'location': self.req_data["location"],
            'start': {
                'dateTime': date + 'T' + start_time + ':00',
                'timeZone': timeZone,
            },
            'end': {
                'dateTime': date + 'T' + end_time + ':00',
                'timeZone': timeZone,
            }
        }

        if frequency:
            event['recurrence'] = [frequency]
        if len(self.invitees) > 0:
            attendees = []
            for person in self.invitees:
                attendees.append({'email': person, "responseStatus": "accepted"})
            event['attendees'] = attendees
        return event

    def execute(self):
        date = self.req_data["date"]
        start_time = self.req_data["start_time"]
        end_time = self.req_data["end_time"]
        occurrences = self.req_data["occurrences"]

        events = []

        if date and start_time and end_time:
            events.append(self.getEventInfo(self.req_data['frequency'], date, start_time, end_time))

        for occurrence in occurrences:
            frequency = occurrence['frequency']
            date = occurrence['date']
            start_time = occurrence['start_time']
            end_time = occurrence['end_time']
            events.append(self.getEventInfo(frequency, date, start_time, end_time))

        return events
