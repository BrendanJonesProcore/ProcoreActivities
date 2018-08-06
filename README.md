# ProcoreActivities
One centralized location to learn about all of the activites that occur at Procore.

## Getting Started

### System Requirements
 - Python 2.7.10
 - Node   9.4.0

### Setup Instructions
  1. Go into the React part of the repo: `cd static`
  2. Install all node modules: `npm install`
  3. For development, run `npm run watch` This will allow you to make changes to the React code, and see those changes live as they happen, with the Flask server serving the content. 
  4. Go to the Python part of the repo: `cd ../server`
  5. If you don't have env vars configured, reach out to a team member on #activities_project and set them up
  6. Install all Python dependencies by running `pip install -r requirements.txt'
  7. Boot up the server by running `python server.py`
  8. Navigate to `localhost:5000` and you'll see the Python server running and serving our React content.


### Deployment
1. Build the Javascript `bundle.js` file by doing:
  - `cd static`
  - `npm install` (if any new node_modules were added)
  - `npm run build`
2. If any pip libraries were installed, be sure to append them (line by line) in `requirements.txt`
3. Add files and deploy!
  - `git add .`
  - `git commit -m "Your commit message"`
  - `git push heroku master`
