import google.oauth2.credentials
import google_auth_oauthlib.flow
import googleapiclient.discovery
import os.path
import os
import requests
from flask import Blueprint, redirect, session, request, jsonify, url_for
from helpers.auth import credentials_to_dict

auth = Blueprint('auth', __name__)
SCOPES = ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/userinfo.profile"]
CLIENT_SECRETS_FILE = os.path.dirname(__file__) + '/../client_secret.json'

@auth.route('/authorize')
def authorize():
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=url_for('auth.oauth2callback', _external=True))

    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='false')

    session['state'] = state
    return redirect(authorization_url)


@auth.route('/oauth2callback')
def oauth2callback():
    state = session['state']

    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES, state=state)
    flow.redirect_uri = url_for('auth.oauth2callback', _external=True)

    # Use the authorization server's response to fetch the OAuth 2.0 tokens.
    authorization_response = request.url
    flow.fetch_token(authorization_response=authorization_response)

    credentials = flow.credentials
    session['credentials'] = credentials_to_dict(credentials)
    grab_and_store_user_metadata()

    # Check that it is a @procore.com email
    email_server = session['email'].split("@", 1)[1].lower()

    if email_server != "procore.com":
        # Reject the login
        session.clear()
        return "You must be logged in under a procore.com google account to use this.", 401

    return redirect(url_for('index'))

def grab_and_store_user_metadata():
    credentials = google.oauth2.credentials.Credentials(
        **session['credentials'])
    info = googleapiclient.discovery.build(
        "people", "v1", credentials=credentials)
    data = info.people().get(resourceName="people/me",personFields="photos,names,emailAddresses").execute()
    photos = data["photos"]
    name = data["names"][0]["displayName"]
    if "emailAddresses" in data: # There's a chance someone might have a google account without gmail
        emails = data["emailAddresses"]
        email_address = get_primary_email(emails)
        session['email'] = email_address
    profile_picture_url = get_profile_picture_from_photos(photos)
    session['name'] = name
    session['avatar_url'] = profile_picture_url

def get_primary_email(emails):
    for e in emails:
        if (e["metadata"]["primary"]):
            return e["value"]

def get_profile_picture_from_photos(photos):
    for p in photos:
        if (p["metadata"]["source"]["type"]) == "PROFILE":
            return p["url"]

@auth.route('/logout')
def clear_credentials():
    credentials = google.oauth2.credentials.Credentials(
      **session['credentials'])
    revoke = requests.post('https://accounts.google.com/o/oauth2/revoke',
      params={'token': credentials.token},
      headers = {'content-type': 'application/x-www-form-urlencoded'})
    if 'credentials' in session:
        del session['credentials']
    
    return redirect(url_for('auth.authorize'))

