// Initialize all app features
document.addEventListener('DOMContentLoaded', function() {
    // Initialize maps
    initializeMaps();
    
    // Setup all event listeners
    setupSOSButton();
    setupFakeCall();
    setupContactForm();
    setupRouteFind();
    
    // Request notification permission
    if ("Notification" in window) {
        Notification.requestPermission();
    }
    
    // Initialize contact list
    contactsList = [];
});