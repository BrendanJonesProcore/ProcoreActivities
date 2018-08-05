from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

event_tags = db.Table('event_tags',
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id')),
    db.Column('event_id', db.Integer, db.ForeignKey('events.id'))
)

interests = db.Table('interests',
    db.Column('event_id', db.Integer, db.ForeignKey('events.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'))
)

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=False, nullable=False)
    home_campus = db.Column(db.String(80), unique=False)
    email = db.Column(db.String(80), unique=True, nullable=False)
    events_interested_in = db.relationship("Event", secondary=interests)
    def __repr__(self):
        return '<User %r>' % self.name

class Tag(db.Model):
    __tablename__ = "tags"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    events_with_tag = db.relationship("Event", secondary=event_tags)
    def __repr__(self):
        return '<Tag %r>' % self.name

class Event(db.Model):
    __tablename__ = "events"
    id = db.Column(db.Integer, primary_key=True)
    campus = db.Column(db.String(120), unique=False, nullable=True)
    tags = db.relationship("Tag", secondary=event_tags)
    interested_users = db.relationship("User", secondary=interests)

    def __repr__(self):
        return '<Event %r>' % self.campus

class Schedule(db.Model):
    __tablename__ = "schedules"
    id = db.Column(db.Integer, primary_key=True)
    google_calendar_id = db.Column(db.String(80), nullable=False)

    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    event = db.relationship('Event', backref=db.backref('schedules', lazy=True))
