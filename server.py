from flask import Flask, render_template, redirect, url_for, session, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from routes.api import api
from routes.auth import auth
from database import db
import os

app = Flask(__name__, static_folder="static/dist", template_folder="static") 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/2.db'
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'  # We need this
SCOPES = ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/userinfo.profile", "http://procore-activities.herokuapp.com/auth/oauth2callback"]
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
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
    app.run(debug=True)
