// Global audio variables
let ringtone;
let callAudio;

// Initialize Firebase (Add your Firebase configuration)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "XXXXXXXXXXXXXXXXXXX",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);

// Get database reference
const db = firebase.database();
const auth = firebase.auth();

// Initialize auth state
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User is signed in:', user.uid);
        loadContacts();
        startLocationTracking();
    } else {
        // Sign in anonymously for demo purposes
        auth.signInAnonymously()
            .catch((error) => {
                console.error('Error signing in anonymously:', error);
            });
    }
});

// Global Variables
let map;
let routeMap;
let currentPosition;
let contactsList = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeMaps();
    setupSOSButton();
    setupFakeCall();
    setupContactForm();
    setupRouteFind();
    loadContacts();
});

// Initialize Google Maps
function initializeMaps() {
    // Main location map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: { lat: -34.397, lng: 150.644 }
    });

    // Route map
    routeMap = new google.maps.Map(document.getElementById('routeMap'), {
        zoom: 13,
        center: { lat: -34.397, lng: 150.644 }
    });

    // Get current location
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            position => {
                currentPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                updateCurrentLocation(currentPosition);
            },
            error => {
                console.error('Error getting location:', error);
                document.getElementById('locationStatus').textContent = 'Unable to get location';
            }
        );
    }
}

// Update current location on map
let locationUpdateInterval;

function updateCurrentLocation(position) {
    const location = {
        lat: position.lat,
        lng: position.lng,
        timestamp: Date.now()
    };
    
    // Update map
    map.setCenter(position);
    new google.maps.Marker({
        position: position,
        map: map,
        title: 'Your Location'
    });

    // Store location in Firebase
    if (firebase.auth().currentUser) {
        db.ref('locations/' + firebase.auth().currentUser.uid).set(location);
    }
}

// Start continuous location tracking
function startLocationTracking() {
    if ("geolocation" in navigator) {
        locationUpdateInterval = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    currentPosition = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    updateCurrentLocation(currentPosition);
                    document.getElementById('locationStatus').textContent = 'Location tracking active';
                },
                (error) => {
                    console.error('Error getting location:', error);
                    document.getElementById('locationStatus').textContent = 'Error: ' + error.message;
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        }, 30000); // Update every 30 seconds
    } else {
        document.getElementById('locationStatus').textContent = 'Geolocation is not supported';
    }
}

// SOS Button functionality
function setupSOSButton() {
    const sosButton = document.getElementById('sosButton');
    sosButton.addEventListener('click', async () => {
        if (currentPosition) {
            // Send alert to emergency contacts
            const message = `EMERGENCY ALERT! Location: https://www.google.com/maps?q=${currentPosition.lat},${currentPosition.lng}`;
            await sendEmergencyAlert(message);
            alert('Emergency alert sent to your contacts!');
        } else {
            alert('Unable to get your location. Please enable location services.');
        }
    });
}

// Send emergency alert to contacts
async function sendEmergencyAlert(message) {
    if (!firebase.auth().currentUser) {
        alert('Please sign in to send emergency alerts');
        return;
    }

    // Store alert in Firebase
    const alertData = {
        message: message,
        timestamp: Date.now(),
        location: currentPosition,
        userId: firebase.auth().currentUser.uid
    };

    // Add alert to Firebase
    await db.ref('alerts').push(alertData);

    // Send alert to each contact
    contactsList.forEach(async (contact) => {
        // Store notification for each contact
        await db.ref('notifications').push({
            contactId: contact.phone,
            message: message,
            timestamp: Date.now(),
            status: 'pending'
        });

        // In a production environment, you would integrate with a messaging service
        // like Twilio for SMS or a cloud function for email
        console.log(`Alert sent to ${contact.name}: ${message}`);
    });

    // Trigger browser notification if supported
    if ("Notification" in window) {
        if (Notification.permission === "granted") {
            new Notification("Emergency Alert Sent", {
                body: "Your emergency contacts have been notified.",
                icon: "/icon.png"
            });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("Emergency Alert Sent", {
                        body: "Your emergency contacts have been notified.",
                        icon: "/icon.png"
                    });
                }
            });
        }
    }
}

// Fake Call functionality
function setupFakeCall() {
    const fakeCallButton = document.getElementById('fakeCallButton');
    const callScreen = document.getElementById('callScreen');
    const acceptCall = document.getElementById('acceptCall');
    const rejectCall = document.getElementById('rejectCall');

    fakeCallButton.addEventListener('click', () => {
        callScreen.classList.remove('hidden');
        playRingtone();
    });

    acceptCall.addEventListener('click', () => {
        stopRingtone();
        simulateCallInProgress();
    });

    rejectCall.addEventListener('click', () => {
        stopRingtone();
        callScreen.classList.add('hidden');
    });
}

// Simulated call functions
function playRingtone() {
    ringtone = new Audio('https://assets.mixkit.co/active_storage/sfx/2356/2356-preview.mp3');
ringtone.loop = true;
ringtone.play();
}

function stopRingtone() {
    ringtone.pause();
ringtone.currentTime = 0;
}

function simulateCallInProgress() {
    callAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2355/2355-preview.mp3');
callAudio.loop = true;
callAudio.play();
setTimeout(() => {
    callAudio.pause();
    callAudio.currentTime = 0;
    document.getElementById('callScreen').classList.add('hidden');
}, 30000); // End call after 30 seconds
}

// Safe Route functionality
function setupRouteFind() {
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');
    const findRouteButton = document.getElementById('findRoute');

    // Initialize autocomplete
    new google.maps.places.Autocomplete(originInput);
    new google.maps.places.Autocomplete(destinationInput);

    findRouteButton.addEventListener('click', () => {
        calculateAndDisplayRoute(
            originInput.value,
            destinationInput.value
        );
    });
}

// Calculate and display safe route
function calculateAndDisplayRoute(origin, destination) {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(routeMap);

    directionsService.route(
        {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.WALKING
        },
        (response, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(response);
            } else {
                alert('Could not calculate route: ' + status);
            }
        }
    );
}

// Contact management
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addContact();
    });
}

function addContact() {
    const name = document.getElementById('contactName').value;
    const phone = document.getElementById('contactPhone').value;
    const email = document.getElementById('contactEmail').value;

    const contact = { name, phone, email };
    contactsList.push(contact);
    saveContacts();
    displayContacts();
    document.getElementById('contactForm').reset();
}

function saveContacts() {
    if (firebase.auth().currentUser) {
        db.ref('contacts/' + firebase.auth().currentUser.uid).set(contactsList);
    }
}

function loadContacts() {
    if (firebase.auth().currentUser) {
        db.ref('contacts/' + firebase.auth().currentUser.uid).once('value')
            .then((snapshot) => {
                const contacts = snapshot.val();
                if (contacts) {
                    contactsList = contacts;
                    displayContacts();
                }
            })
            .catch((error) => {
                console.error('Error loading contacts:', error);
            });
    }
}

function displayContacts() {
    const contactsDiv = document.getElementById('contactsList');
    contactsDiv.innerHTML = '';
    
    contactsList.forEach((contact, index) => {
        const contactElement = document.createElement('div');
        contactElement.className = 'contact-card';
        contactElement.innerHTML = `
            <div>
                <strong>${contact.name}</strong><br>
                ${contact.phone}<br>
                ${contact.email}
            </div>
            <button class="delete-contact" onclick="deleteContact(${index})">Delete</button>
        `;
        contactsDiv.appendChild(contactElement);
    });
}

function deleteContact(index) {
    contactsList.splice(index, 1);
    saveContacts();
    displayContacts();
}