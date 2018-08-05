from server import *
db.create_all()
event1=Event(event_name="Soccer", campus="Carpinteria", event_description="Play soccer in Carpinteria")
event2=Event(event_name="Knitting", campus="Carpinteria", event_description="Knit every Friday at P3")
event3=Event(event_name="Hiking", campus="Sydney", event_description="Go hiking in Sydney")
tag1=Tag(tag_name="sport")
tag2=Tag(tag_name="paid")
tag3=Tag(tag_name="crafts")
tag4=Tag(tag_name="free")

event1.event_tags.append(tag1)
event1.event_tags.append(tag2)
event2.event_tags.append(tag2)
event2.event_tags.append(tag3)
event3.event_tags.append(tag1)
event3.event_tags.append(tag4)

db.session.add(event1)
db.session.add(event2)
db.session.add(event3)

db.session.commit()
