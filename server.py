from flask import Flask, render_template, redirect, url_for, session, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from routes.api import api
from routes.auth import auth
from database import db
import os

app = Flask(__name__, static_folder="static/dist", template_folder="static") 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
app.secret_key = os.getenv('FLASK_SECRET_KEY')
SCOPES = ["https://www.googleapis.com/auth/calendar", 
  "https://www.googleapis.com/auth/userinfo.profile", 
  "http://procore-activities.herokuapp.com/auth/oauth2callback"]

with app.app_context():
    db.init_app(app)
    app.register_blueprint(api, url_prefix='/api')
    app.register_blueprint(auth, url_prefix='/auth')

@app.route("/")
def index():
    if 'credentials' not in session:
        return redirect('/auth/authorize')
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
