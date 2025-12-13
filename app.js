// Pre-loaded default cards (same as extension)
const defaultCards = [
    { front: "How to declare ArrayList in Java?", back: "ArrayList<Integer> list = new ArrayList<>();", category: "Java" },
    { front: "Binary Search Time Complexity?", back: "O(log n)", category: "DSA" },
    { front: "Java String to Int conversion?", back: "Integer.parseInt(str)", category: "Java" },
    { front: "How to create array in Java?", back: "int[] arr = new int[5];", category: "Java" },
    { front: "Linear Search Time Complexity?", back: "O(n)", category: "DSA" },
    { front: "How to find array length in Java?", back: "arr.length", category: "Java" },
    { front: "Quick Sort Time Complexity (Average)?", back: "O(n log n)", category: "DSA" },
    { front: "How to reverse a string in Java?", back: "new StringBuilder(str).reverse().toString()", category: "Java" },
    { front: "Stack operations time complexity?", back: "Push: O(1), Pop: O(1), Peek: O(1)", category: "DSA" },
    { front: "How to check if string is empty?", back: "str.isEmpty() or str.length() == 0", category: "Java" },
    { front: "Queue time complexity?", back: "Enqueue: O(1), Dequeue: O(1)", category: "DSA" },
    { front: "How to compare strings in Java?", back: "str1.equals(str2)", category: "Java" },
    { front: "Binary Tree height formula?", back: "Height = log₂(n+1) - 1 for complete tree", category: "DSA" },
    { front: "How to iterate HashMap in Java?", back: "for (Map.Entry<K,V> entry : map.entrySet())", category: "Java" },
    { front: "DFS Time Complexity?", back: "O(V + E) where V=vertices, E=edges", category: "DSA" },
    { front: "How to create HashSet in Java?", back: "HashSet<Integer> set = new HashSet<>();", category: "Java" },
    { front: "Merge Sort Time Complexity?", back: "O(n log n) - always stable", category: "DSA" },
    { front: "How to sort array in Java?", back: "Arrays.sort(arr)", category: "Java" },
    { front: "Linked List insertion at head?", back: "O(1)", category: "DSA" },
    { front: "How to convert char to String?", back: "String.valueOf(ch) or Character.toString(ch)", category: "Java" }
];

let allCards = [];
let customCards = [];
let categoryChart = null;

// Practice mode variables
let practiceMode = false;
let practiceCards = [];
let currentPracticeIndex = 0;
let knownCards = [];
let reviewCards = [];

// SYNC KEY - This connects dashboard with extension
const SYNC_KEY = 'codecards_sync';

// Initialize app
function init() {
    loadCards();
    setupEventListeners();
    createCategoryChart();
}

// Load cards from localStorage with SYNC
function loadCards() {
    // Try to load from sync storage first (shared with extension)
    const syncedData = localStorage.getItem(SYNC_KEY);
    
    if (syncedData) {
        try {
            customCards = JSON.parse(syncedData);
        } catch (e) {
            customCards = [];
        }
    } else {
        // Fallback to old storage
        const stored = localStorage.getItem('flashcards');
        customCards = stored ? JSON.parse(stored) : [];
    }
    
    // Combine default + custom cards
    allCards = [...defaultCards, ...customCards];
    
    // Update UI
    updateStats();
    displayCards();
    updateCategoryChart();
}

// Save cards to localStorage with SYNC
function saveCards() {
    // Save to sync key (shared with extension)
    localStorage.setItem(SYNC_KEY, JSON.stringify(customCards));
    
    // Also save to old key for backward compatibility
    localStorage.setItem('flashcards', JSON.stringify(customCards));
}

// Update statistics
function updateStats() {
    document.getElementById('totalCards').textContent = allCards.length;
    
    // Count cards by category
    const javaCount = allCards.filter(card => card.category === 'Java').length;
    const dsaCount = allCards.filter(card => card.category === 'DSA').length;
    
    document.getElementById('javaCards').textContent = javaCount;
    document.getElementById('dsaCards').textContent = dsaCount;
    document.getElementById('customCards').textContent = customCards.length;
}

// Create pie chart
function createCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#4facfe',
                    '#43e97b'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
    
    updateCategoryChart();
}

// Update pie chart data
function updateCategoryChart() {
    if (!categoryChart) return;
    
    // Count cards per category
    const categoryCounts = {};
    allCards.forEach(card => {
        categoryCounts[card.category] = (categoryCounts[card.category] || 0) + 1;
    });
    
    // Update chart
    categoryChart.data.labels = Object.keys(categoryCounts);
    categoryChart.data.datasets[0].data = Object.values(categoryCounts);
    categoryChart.update();
}

// Display cards in grid
function displayCards(filterCategory = 'all', searchTerm = '') {
    const cardsGrid = document.getElementById('cardsGrid');
    cardsGrid.innerHTML = '';
    
    // Filter cards
    let filteredCards = allCards;
    
    if (filterCategory !== 'all') {
        filteredCards = filteredCards.filter(card => card.category === filterCategory);
    }
    
    if (searchTerm) {
        filteredCards = filteredCards.filter(card => 
            card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.back.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    // Show message if no cards
    if (filteredCards.length === 0) {
        cardsGrid.innerHTML = `
            <div class="no-cards">
                <h3>No cards found</h3>
                <p>Try adjusting your filters or add a new card!</p>
            </div>
        `;
        return;
    }
    
    // Display each card
    filteredCards.forEach((card, index) => {
        const isDefault = allCards.indexOf(card) < defaultCards.length;
        const actualIndex = isDefault ? -1 : allCards.indexOf(card) - defaultCards.length;
        
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.innerHTML = `
            <div class="card-header">
                <span class="card-category">${card.category}</span>
                <div class="card-actions">
                    ${!isDefault ? `
                        <button class="edit-btn" onclick="editCard(${actualIndex})">✏️ Edit</button>
                        <button class="delete-btn" onclick="deleteCard(${actualIndex})">🗑️</button>
                    ` : ''}
                </div>
            </div>
            <div class="card-front">${card.front}</div>
            <div class="card-back">${card.back}</div>
        `;
        
        cardsGrid.appendChild(cardElement);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Add card form
    document.getElementById('addCardForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newCard = {
            front: document.getElementById('frontInput').value.trim(),
            back: document.getElementById('backInput').value.trim(),
            category: document.getElementById('categoryInput').value
        };
        
        customCards.push(newCard);
        saveCards();
        loadCards();
        
        // Clear form
        document.getElementById('addCardForm').reset();
        
        // Show success message
        alert('Card added successfully! 🎉');
    });
    
    // Filter by category
    document.getElementById('filterCategory').addEventListener('change', (e) => {
        const searchTerm = document.getElementById('searchInput').value;
        displayCards(e.target.value, searchTerm);
    });
    
    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const filterCategory = document.getElementById('filterCategory').value;
        displayCards(filterCategory, e.target.value);
    });
    
    // Practice mode buttons
    document.getElementById('startPracticeBtn').addEventListener('click', startPracticeMode);
    document.getElementById('exitPracticeBtn').addEventListener('click', exitPracticeMode);
    document.getElementById('revealBtn').addEventListener('click', revealAnswer);
    document.getElementById('knowItBtn').addEventListener('click', markKnown);
    document.getElementById('needReviewBtn').addEventListener('click', markReview);
}

// Practice Mode Functions
function startPracticeMode() {
    practiceMode = true;
    currentPracticeIndex = 0;
    knownCards = [];
    reviewCards = [];
    
    // Shuffle all cards for practice
    practiceCards = [...allCards].sort(() => Math.random() - 0.5);
    
    // Hide main sections
    document.querySelector('.add-card-section').style.display = 'none';
    document.querySelector('.filter-section').style.display = 'none';
    document.querySelector('.cards-grid').style.display = 'none';
    document.querySelector('.chart-section').style.display = 'none';
    
    // Show practice section
    document.getElementById('practiceSection').style.display = 'block';
    
    showPracticeCard();
}

function exitPracticeMode() {
    practiceMode = false;
    
    // Show summary
    alert(`Practice Complete!\n\n✅ Known: ${knownCards.length}\n❌ Need Review: ${reviewCards.length}\n\nKeep practicing! 💪`);
    
    // Show main sections
    document.querySelector('.add-card-section').style.display = 'block';
    document.querySelector('.filter-section').style.display = 'block';
    document.querySelector('.cards-grid').style.display = 'grid';
    document.querySelector('.chart-section').style.display = 'block';
    
    // Hide practice section
    document.getElementById('practiceSection').style.display = 'none';
}

function showPracticeCard() {
    if (currentPracticeIndex >= practiceCards.length) {
        exitPracticeMode();
        return;
    }
    
    const card = practiceCards[currentPracticeIndex];
    
    document.getElementById('practiceProgress').textContent = 
        `Card ${currentPracticeIndex + 1} of ${practiceCards.length}`;
    document.getElementById('practiceCategory').textContent = card.category;
    document.getElementById('practiceQuestion').textContent = card.front;
    document.getElementById('practiceAnswer').textContent = card.back;
    
    // Reset view
    document.getElementById('practiceAnswer').style.display = 'none';
    document.getElementById('revealBtn').style.display = 'block';
    document.getElementById('practiceActions').style.display = 'none';
}

function revealAnswer() {
    document.getElementById('practiceAnswer').style.display = 'block';
    document.getElementById('revealBtn').style.display = 'none';
    document.getElementById('practiceActions').style.display = 'flex';
}

function markKnown() {
    knownCards.push(practiceCards[currentPracticeIndex]);
    currentPracticeIndex++;
    showPracticeCard();
}

function markReview() {
    reviewCards.push(practiceCards[currentPracticeIndex]);
    currentPracticeIndex++;
    showPracticeCard();
}

// Edit card
window.editCard = function(index) {
    const card = customCards[index];
    
    const newFront = prompt('Edit Front:', card.front);
    if (newFront === null) return;
    
    const newBack = prompt('Edit Back:', card.back);
    if (newBack === null) return;
    
    customCards[index] = {
        ...card,
        front: newFront.trim(),
        back: newBack.trim()
    };
    
    saveCards();
    loadCards();
    alert('Card updated! ✅');
};

// Delete card
window.deleteCard = function(index) {
    if (confirm('Delete this card?')) {
        customCards.splice(index, 1);
        saveCards();
        loadCards();
        alert('Card deleted! 🗑️');
    }
};

// Initialize when page loads
init();