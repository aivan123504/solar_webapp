class LeafletMap {

    constructor(containerId, center, zoom) {
        this.map = L.map(containerId).setView(center, zoom);
        this.initTileLayer();
        this.markerCounts = {}; // Tracks the number of people occupying each station
        this.markers = []; // Array to store marker objects
        // Button elements
        this.btn = document.getElementById('btn');
        this.btn1 = document.getElementById('btn1');
        this.btn2 = document.getElementById('btn2');
        this.idContainer = document.getElementById('logContainer');

        // Modal elements for area selection
        this.modal = document.getElementById('areaModal');
        this.closeModal = document.getElementById('closeModal');
        this.modalMessage = document.getElementById('modalMessage');
        this.confirmBtn = document.getElementById('confirmBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.fullStationModal = document.getElementById('fullStationModal');
        this.closeFullStationModal = document.getElementById('closeFullStationModal');

        // Modal elements for occupation form
        this.occupationModal = document.getElementById('occupationModal');
        this.closeOccupationModal = document.getElementById('closeOccupationModal');
        this.submitOccupationBtn = document.getElementById('submitOccupationBtn');
        this.nameInput = document.getElementById('name');
        this.placardNumberInput = document.getElementById('placardNumber');
        this.homeAddressInput = document.getElementById('homeAddress');
        this.phoneNumberInput = document.getElementById('phoneNumber');

        // Event listeners for buttons
        this.btn.addEventListener('click', () => this.handleButtonClick('Manolo Fortich Charging Station', 8.371400, 124.855103));
        this.btn1.addEventListener('click', () => this.handleButtonClick('Dalirig Charging Station', 8.376177, 124.903178));
        this.btn2.addEventListener('click', () => this.handleButtonClick('Alae Charging Station', 8.420810, 124.813377));

        // Modal controls
        this.closeModal.addEventListener('click', () => this.closeModalWindow());
        this.confirmBtn.addEventListener('click', () => this.confirmAreaOccupation());
        this.cancelBtn.addEventListener('click', () => this.closeModalWindow());
        this.closeFullStationModal.addEventListener('click', () => this.closeFullStationModalWindow());

        // Occupation modal controls
        this.closeOccupationModal.addEventListener('click', () => this.closeOccupationModalWindow());
        this.submitOccupationBtn.addEventListener('click', () => this.submitOccupationForm());
    }

    initTileLayer() {
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 13,
        }).addTo(this.map);
    }

    addMarker(lat, long, message) {
        const marker = L.marker([lat, long]).addTo(this.map);
        
        // Initialize marker count if it's the first marker for the station
        if (!this.markerCounts[message]) {
            this.markerCounts[message] = 0;
        }

        this.updateMarkerPopup(marker, message);

        // Clicking the marker just shows the popup
        marker.on('click', () => {
            this.updateMarkerPopup(marker, message);
        });

        this.markers.push(marker);
    }

    
    updateMarkerPopup(marker, message) {
        const count = this.markerCounts[message];
        marker.bindPopup(`${message}<br>Number of People Occupied this area: ${count}`).openPopup();
    }

    loadMarkersFromJson(url) {
        fetch(url)
        .then(response => response.json())
        .then(data => {
            data.forEach(marker => {
                this.addMarker(marker.latitude, marker.longitude, marker.message);
            });
        })
        .catch(error => console.error("Error Loading servers:", error));
    }

    // Handle button click to show modal and add marker
    handleButtonClick(stationName, lat, long) {
        if (this.markerCounts[stationName] >= 8) {
            this.showFullStationModal(stationName);
        } else {
            this.modalMessage.innerHTML = `Do you want to occupy the <strong>${stationName}</strong>?`;
            this.modal.style.display = 'block';
            this.confirmBtn.dataset.stationName = stationName;
            this.confirmBtn.dataset.lat = lat;
            this.confirmBtn.dataset.long = long;
        }
    }

    // Show modal for full station
    showFullStationModal(stationName) {
        this.fullStationModal.style.display = 'block';
        const fullMessage = `${stationName} is already fully occupied. Please choose another station.`;
        document.getElementById('fullStationMessage').innerText = fullMessage;
    }

    // Close the full station modal
    closeFullStationModalWindow() {
        this.fullStationModal.style.display = 'none';
    }

    // Close the general modal
    closeModalWindow() {
        this.modal.style.display = 'none';
    }

    // Open occupation modal to collect user details
    openOccupationModal() {
        this.occupationModal.style.display = 'block';
    }

    // Close the occupation modal
    closeOccupationModalWindow() {
        this.occupationModal.style.display = 'none';
    }

    // Confirm occupation and add marker
    confirmAreaOccupation() {
        const stationName = this.confirmBtn.dataset.stationName;
        const lat = this.confirmBtn.dataset.lat;
        const long = this.confirmBtn.dataset.long;

        // Add marker only if the count is below 8
        if (this.markerCounts[stationName] < 8) {
            this.closeModalWindow();  // Close the area confirmation modal
            this.openOccupationModal();  // Open the occupation details modal
        }
    }

    // Submit occupation form
    submitOccupationForm() {
        const name = this.nameInput.value;
        const placardNumber = this.placardNumberInput.value;
        const homeAddress = this.homeAddressInput.value;
        const phoneNumber = this.phoneNumberInput.value;

        const stationName = this.confirmBtn.dataset.stationName;
        const lat = this.confirmBtn.dataset.lat;
        const long = this.confirmBtn.dataset.long;

        // Validation: check if all fields are filled
        if (name && placardNumber && homeAddress && phoneNumber) {
            if (this.markerCounts[stationName] < 8) {
                // Increment marker count
                this.markerCounts[stationName]++;

                // Add the marker or perform other actions here
                this.addMarker(lat, long, stationName);

                // Log the occupation info
                console.log(`Station ${stationName} occupied by ${name}, Placard: ${placardNumber}, Address: ${homeAddress}, Phone: ${phoneNumber}`);
                
                // Close the occupation modal
                this.closeOccupationModalWindow();
            } else {
                alert('This station has reached its maximum occupancy.');
            }
        } else {
            alert('Please fill in all the fields.');
        }
    }

    updateLogDisplay() {
        this.idContainer.innerHTML = ''; 
        this.loggedData.forEach(data => {
            const logItem = document.createElement('div');
            logItem.className = 'log-item';
            this.idContainer.appendChild(logItem);
        });
        this.displayLogCount();
    }
}

const Mymap = new LeafletMap('map', [8.359735, 124.869206], 18);

Mymap.loadMarkersFromJson('charge.json');

document.addEventListener('DOMContentLoaded', () => {
    Mymap.displayLogCount();
    Mymap.loadMarkersFromJson('charge.json');
});