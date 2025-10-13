const FEATURES_CONFIG = [
    {
        name: "danceability",
        label: "Danceability",
        icon: "💃",
        description: "How suitable for dancing (0=Low, 1=High)",
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.1
    },
    {
        name: "loudness",
        label: "Loudness",
        icon: "🔊",
        description: "Overall loudness (0=Quiet, 1=Loud)",
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.1
    },
    {
        name: "acousticness",
        label: "Acousticness",
        icon: "🎸",
        description: "Acoustic sound confidence (0=Electronic, 1=Acoustic)",
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.1
    },
    {
        name: "instrumentalness",
        label: "Instrumentalness",
        icon: "🎻",
        description: "Instrumental content (0=Vocals, 1=Instrumental)",
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.1
    },
    {
        name: "valence",
        label: "Valence (Happy)",
        icon: "😊",
        description: "Musical positivity (0=Sad, 1=Happy)",
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.1
    },
    {
        name: "energy",
        label: "Energy",
        icon: "⚡",
        description: "Intensity and activity (0=Calm, 1=Energetic)",
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.1
    },
    {
        name: "sadness",
        label: "Sadness",
        icon: "😢",
        description: "Emotional sadness (0=Not sad, 1=Very sad)",
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.1
    },
    {
        name: "feelings",
        label: "Feelings",
        icon: "❤️",
        description: "Overall emotional intensity (0=Neutral, 1=Emotional)",
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.1
    }
];

// Demo music database with more diverse options
const MUSIC_DATABASE = [
    { artist_name: "The Weeknd", track_name: "Blinding Lights", genre: "Pop", danceability: 0.8, energy: 0.7, valence: 0.6 },
    { artist_name: "Dua Lipa", track_name: "Don't Start Now", genre: "Pop", danceability: 0.8, energy: 0.8, valence: 0.7 },
    { artist_name: "Tame Impala", track_name: "The Less I Know The Better", genre: "Indie", danceability: 0.7, energy: 0.6, valence: 0.5 },
    { artist_name: "Billie Eilish", track_name: "bad guy", genre: "Pop", danceability: 0.6, energy: 0.5, valence: 0.4 },
    { artist_name: "Post Malone", track_name: "Circles", genre: "Hip-Hop", danceability: 0.7, energy: 0.6, valence: 0.6 },
    { artist_name: "Kendrick Lamar", track_name: "HUMBLE.", genre: "Hip-Hop", danceability: 0.9, energy: 0.8, valence: 0.5 },
    { artist_name: "Taylor Swift", track_name: "Shake It Off", genre: "Pop", danceability: 0.9, energy: 0.8, valence: 0.9 },
    { artist_name: "Arctic Monkeys", track_name: "Do I Wanna Know?", genre: "Rock", danceability: 0.5, energy: 0.4, valence: 0.3 },
    { artist_name: "Lana Del Rey", track_name: "Summertime Sadness", genre: "Pop", danceability: 0.4, energy: 0.3, valence: 0.2 },
    { artist_name: "Drake", track_name: "Hotline Bling", genre: "Hip-Hop", danceability: 0.8, energy: 0.5, valence: 0.6 },
    { artist_name: "Adele", track_name: "Rolling in the Deep", genre: "Pop", danceability: 0.6, energy: 0.8, valence: 0.4 },
    { artist_name: "Coldplay", track_name: "Viva La Vida", genre: "Rock", danceability: 0.5, energy: 0.7, valence: 0.6 },
    { artist_name: "Ed Sheeran", track_name: "Shape of You", genre: "Pop", danceability: 0.9, energy: 0.7, valence: 0.8 },
    { artist_name: "Bruno Mars", track_name: "Uptown Funk", genre: "Funk", danceability: 1.0, energy: 0.9, valence: 0.9 },
    { artist_name: "Imagine Dragons", track_name: "Believer", genre: "Rock", danceability: 0.7, energy: 0.9, valence: 0.5 }
];

let currentUserInput = [];
let modelAccuracy = 0.000;
let isLoading = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeInputForm();
    setupNavigation();
    setupEventListeners();
    showSection('home');
});

// Setup all event listeners
function setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
        if (e.ctrlKey && e.key === 'Enter') {
            getRecommendations();
        }
    });

    // Input field auto-advance
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('input-field') && e.target.value.length === 3) {
            const nextInput = e.target.parentElement.nextElementSibling?.querySelector('.input-field');
            if (nextInput) {
                nextInput.focus();
            }
        }
    });
}

// Navigation functionality
function setupNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
        });
    }
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            
            // Close mobile menu
            if (navLinks) {
                navLinks.classList.remove('active');
                if (menuToggle) {
                    menuToggle.querySelector('i').classList.add('fa-bars');
                    menuToggle.querySelector('i').classList.remove('fa-times');
                }
            }
            
            // Update active states
            document.querySelectorAll('.nav-link').forEach(nav => {
                nav.classList.remove('active');
            });
            this.classList.add('active');
            
            // Show section
            showSection(sectionId);
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Scroll to top of section with offset for fixed header
        window.scrollTo({
            top: targetSection.offsetTop - 80,
            behavior: 'smooth'
        });
    }
}

// Initialize the input form with feature inputs
function initializeInputForm() {
    const inputForm = document.getElementById('inputForm');
    if (!inputForm) return;
    
    inputForm.innerHTML = '';
    
    FEATURES_CONFIG.forEach(feature => {
        const inputRow = document.createElement('div');
        inputRow.className = 'input-row';
        
        inputRow.innerHTML = `
            <span class="input-label">${feature.icon} ${feature.label}</span>
            <input type="number" 
                   id="${feature.name}" 
                   class="input-field" 
                   min="${feature.min}" 
                   max="${feature.max}" 
                   step="${feature.step}" 
                   value="${feature.defaultValue}"
                   onchange="validateInput(this)"
                   oninput="updateRangeDisplay(this)"
                   aria-label="${feature.label}">
            <span class="input-description">${feature.description}</span>
            <span class="range-display" id="${feature.name}-display">${feature.defaultValue}</span>
        `;
        
        inputForm.appendChild(inputRow);
    });
}

// Update range display for input fields
function updateRangeDisplay(input) {
    const display = document.getElementById(`${input.id}-display`);
    if (display) {
        display.textContent = input.value;
    }
    validateInput(input);
}

// Validate input values
function validateInput(input) {
    const value = parseFloat(input.value);
    const display = document.getElementById(`${input.id}-display`);
    
    if (isNaN(value) || value < 0 || value > 1) {
        input.style.borderColor = 'var(--warning)';
        input.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
        if (display) display.style.color = 'var(--warning)';
        input.title = 'Please enter a value between 0 and 1';
        return false;
    } else {
        input.style.borderColor = 'var(--primary)';
        input.style.backgroundColor = 'var(--white)';
        if (display) display.style.color = 'var(--success)';
        input.title = '';
        return true;
    }
}

// Get all input values
function getAllInputs() {
    const inputs = {};
    let isValid = true;
    
    FEATURES_CONFIG.forEach(feature => {
        const input = document.getElementById(feature.name);
        if (!input) {
            isValid = false;
            return;
        }
        
        const value = parseFloat(input.value);
        
        if (!validateInput(input)) {
            isValid = false;
        }
        
        inputs[feature.name] = value;
    });
    
    return isValid ? inputs : null;
}

// Update status message with animation
function updateStatus(message, type = 'info') {
    const statusBar = document.getElementById('statusBar');
    if (!statusBar) return;
    
    // Add animation class
    statusBar.style.opacity = '0';
    setTimeout(() => {
        statusBar.textContent = message;
        
        // Update colors based on type
        switch(type) {
            case 'error':
                statusBar.style.borderLeftColor = 'var(--warning)';
                statusBar.style.color = 'var(--warning)';
                break;
            case 'success':
                statusBar.style.borderLeftColor = 'var(--success)';
                statusBar.style.color = 'var(--success)';
                break;
            default:
                statusBar.style.borderLeftColor = 'var(--primary)';
                statusBar.style.color = 'var(--text)';
        }
        
        statusBar.style.opacity = '1';
    }, 300);
}

// Simple recommendation algorithm
function calculateMatchScore(userPreferences, song) {
    let score = 0;
    let totalWeight = 0;
    
    // Calculate similarity for each feature
    if (userPreferences.danceability !== undefined && song.danceability !== undefined) {
        score += (1 - Math.abs(userPreferences.danceability - song.danceability)) * 0.2;
        totalWeight += 0.2;
    }
    
    if (userPreferences.energy !== undefined && song.energy !== undefined) {
        score += (1 - Math.abs(userPreferences.energy - song.energy)) * 0.2;
        totalWeight += 0.2;
    }
    
    if (userPreferences.valence !== undefined && song.valence !== undefined) {
        score += (1 - Math.abs(userPreferences.valence - song.valence)) * 0.15;
        totalWeight += 0.15;
    }
    
    // Add some randomness for variety
    score += (Math.random() * 0.3);
    totalWeight += 0.3;
    
    return totalWeight > 0 ? (score / totalWeight) : 0;
}

// Get music recommendations
async function getRecommendations() {
    if (isLoading) return;
    
    const inputs = getAllInputs();
    
    if (!inputs) {
        updateStatus('❌ Please enter valid numbers between 0 and 1', 'error');
        return;
    }
    
    isLoading = true;
    updateStatus('🔄 Analyzing your music preferences...');
    
    const getRecommendationsBtn = document.querySelector('.btn-primary');
    const originalText = getRecommendationsBtn.innerHTML;
    
    // Show loading state
    getRecommendationsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    getRecommendationsBtn.disabled = true;
    
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Calculate recommendations using our simple algorithm
        const recommendations = MUSIC_DATABASE.map(song => {
            const predicted_score = calculateMatchScore(inputs, song);
            return {
                ...song,
                predicted_score: predicted_score
            };
        })
        .sort((a, b) => b.predicted_score - a.predicted_score)
        .slice(0, 8); // Get top 8 recommendations
        
        // Calculate model accuracy (simulated)
        const averageScore = recommendations.reduce((sum, song) => sum + song.predicted_score, 0) / recommendations.length;
        modelAccuracy = Math.min(0.95, 0.7 + (averageScore * 0.25)); // Base accuracy + score influence
        
        currentUserInput = FEATURES_CONFIG.map(feature => inputs[feature.name]);
        
        updateStatus('✅ Recommendations ready! Click to view your personalized songs.', 'success');
        showRecommendations(recommendations);
        
    } catch (error) {
        console.error('Error:', error);
        updateStatus('❌ Error generating recommendations. Please try again.', 'error');
    } finally {
        isLoading = false;
        getRecommendationsBtn.innerHTML = originalText;
        getRecommendationsBtn.disabled = false;
    }
}

// Show recommendations in modal
function showRecommendations(recommendations) {
    const modelAccuracyElement = document.getElementById('modelAccuracy');
    const preferencesDiv = document.getElementById('userPreferences');
    const recommendationsList = document.getElementById('recommendationsList');
    const modal = document.getElementById('recommendationsModal');
    
    if (!modelAccuracyElement || !preferencesDiv || !recommendationsList || !modal) return;
    
    // Update model accuracy
    modelAccuracyElement.textContent = modelAccuracy.toFixed(3);
    
    // Display user preferences
    preferencesDiv.innerHTML = '';
    FEATURES_CONFIG.forEach((feature, index) => {
        const prefItem = document.createElement('div');
        prefItem.className = 'preference-item';
        prefItem.innerHTML = `${feature.icon} ${feature.label}: ${currentUserInput[index].toFixed(2)}`;
        preferencesDiv.appendChild(prefItem);
    });
    
    // Display recommendations
    recommendationsList.innerHTML = '';
    recommendations.forEach((song, index) => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        songCard.style.animationDelay = `${index * 0.1}s`;
        
        // Calculate star rating (1-5 stars based on score)
        const stars = Math.ceil(song.predicted_score * 5);
        const starRating = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
        
        songCard.innerHTML = `
            <div class="song-info">
                <div class="artist-track">🎤 ${song.artist_name} - ${song.track_name}</div>
                <div class="song-details">
                    🎵 ${song.genre} | ${starRating} | Match: ${(song.predicted_score * 100).toFixed(0)}%
                </div>
            </div>
            <div class="song-actions">
                <button class="btn-accent" onclick="openYouTube('${song.artist_name}', '${song.track_name}')" title="Listen on YouTube">
                    <i class="fab fa-youtube"></i> Listen on YouTube
                </button>
            </div>
        `;
        
        recommendationsList.appendChild(songCard);
    });
    
    // Show modal with animation
    modal.style.display = 'block';
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

// Open YouTube search
function openYouTube(artist, track) {
    const query = encodeURIComponent(`${artist} ${track}`);
    const url = `https://www.youtube.com/results?search_query=${query}`;
    window.open(url, '_blank');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('recommendationsModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    updateStatus('✨ Adjust your preferences and discover more music!');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('recommendationsModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Quick preset buttons functionality
function applyPreset(presetName) {
    const presets = {
        party: { danceability: 0.9, energy: 0.9, valence: 0.8, loudness: 0.8 },
        chill: { danceability: 0.4, energy: 0.3, valence: 0.6, acousticness: 0.7 },
        workout: { danceability: 0.8, energy: 0.9, valence: 0.7, loudness: 0.9 },
        focus: { danceability: 0.3, energy: 0.4, valence: 0.5, instrumentalness: 0.6 },
        sad: { valence: 0.2, energy: 0.3, sadness: 0.8, acousticness: 0.6 }
    };
    
    const preset = presets[presetName];
    if (preset) {
        Object.keys(preset).forEach(feature => {
            const input = document.getElementById(feature);
            if (input) {
                input.value = preset[feature];
                validateInput(input);
                updateRangeDisplay(input);
            }
        });
        updateStatus(`🎵 Applied ${presetName} preset! Click "Get Recommendations" to see results.`);
    }
}

// Additional CSS for animations and styling
const additionalCSS = `
.song-card {
    animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.range-display {
    font-size: 0.8em;
    font-weight: bold;
    color: var(--success);
    min-width: 30px;
    text-align: center;
}
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);