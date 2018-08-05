# ProcoreActivities
One centralized location to learn about all of the activites that occur at Procore.

## Getting Started

### System Requirements
 - Python 3.6
 - Node   9.4.0

### Setup Instructions
  1. Go into the React part of the repo: `cd static`
  2. Install all node modules: `npm install`
  3. For development, run `npm run watch` This will allow you to make changes to the React code, and see those changes live as they happen, with the Flask server serving the content.
  4. Go to the Python part of the repo: `cd ../server`
  5. If you don't have the `client_secret.json` file yet, reach out to a team member on #activities_project and paste that file here (inside `ProcoreActivities/server/`)
  6. Install all Python dependencies by running `pip install -r requirements.txt'
  7. Boot up the server by running `python server.py`
  8. Navigate to `localhost:5000` and you'll see the Python server running and serving our React content.

### Python Development Suggestions
  1. Anytime you install a module, add the module to `ProcoreActivities/server/requirements.txt` so other members can add it during installation
  2.  If you see a route method getting bloated, it might be a good idea to abstract the logic to a Service Object.
  
      Service Objects are a design pattern used to help decouple business logic from our `server.py` file. Service objects only serve one business goal, and therefore should only have one public method `execute()`. This allows for better testing, less coupling, and overall cleaner code.

### Deployment & Docker
  Coming soon... maybe
