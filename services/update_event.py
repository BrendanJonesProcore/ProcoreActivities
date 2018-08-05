class UpdateEvent(object):
    def __init__(self, req_data, recurriung=False):
        self.req_data = req_data

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
            'status': 'confirmed',
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
        return event

    def execute(self):
        occurrences = self.req_data["occurrences"]
        events = []

        for occurrence in occurrences:
            frequency = occurrence['frequency']
            date = occurrence['date']
            start_time = occurrence['start_time']
            end_time = occurrence['end_time']
            events.append(self.getEventInfo(frequency, date, start_time, end_time))

        return events
