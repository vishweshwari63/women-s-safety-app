# Women's Safety Web App

This is a web-based women's safety application that provides various features to help ensure personal security.

## Features

1. SOS Button
   - Sends immediate location alerts to emergency contacts
   - Uses browser's geolocation API for accurate positioning

2. Live Location Tracking
   - Real-time location monitoring
   - Displays current location on Google Maps

3. Fake Call Generator
   - Simulates incoming calls
   - Customizable caller information

4. Safe Route Display
   - Integration with Google Maps
   - Suggests safe routes between locations

5. Emergency Contacts Management
   - Store and manage emergency contacts
   - Quick access to important numbers

## Setup Instructions

1. Clone this repository to your local machine

2. Get API Keys:
   - Obtain a Google Maps API key from the Google Cloud Console
   - (Optional) Set up a Firebase project and get configuration details

3. Configure API Keys:
   - Replace `YOUR_API_KEY` in `index.html` with your Google Maps API key
   - Uncomment and update Firebase configuration in `app.js` if using Firebase

4. Local Development:
   - Use a local development server (like Live Server in VS Code)
   - Open index.html in your web browser

## Required APIs and Libraries

1. Google Maps JavaScript API
   - Maps display
   - Places Autocomplete
   - Directions Service

2. (Optional) Firebase
   - Authentication
   - Real-time Database
   - Cloud Functions for notifications

## Deployment

### GitHub Pages Deployment:

1. Create a new repository on GitHub
2. Push your code to the repository
3. Go to Settings > Pages
4. Select your main branch as the source
5. Your site will be published at `https://[username].github.io/[repository]`

### Firebase Hosting Deployment:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize project: `firebase init`
4. Deploy: `firebase deploy`

## Security Considerations

- Keep API keys secure
- Implement proper user authentication
- Use HTTPS for secure data transmission
- Regular security audits
- Data privacy compliance

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details.