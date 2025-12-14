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
    
    // Migrate old "HTML/CSS" category to "HTML"
    let needsSave = false;
    customCards.forEach(card => {
        if (card.category === 'HTML/CSS') {
            card.category = 'HTML';
            needsSave = true;
        }
    });
    if (needsSave) {
        saveCards();
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
                    '#04094b',
                    '#764ba2',
                    '#f093fb',
                    '#4facfe',
                    '#43e97b',
                    '#ff6b6b',
                    '#4ecdc4',
                    '#ffe66d',
                    '#95e1d3',
                    '#f38181'
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
        
        // Create card structure
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        
        const categorySpan = document.createElement('span');
        categorySpan.className = 'card-category';
        categorySpan.textContent = card.category;
        cardHeader.appendChild(categorySpan);
        
        if (!isDefault) {
            const cardActions = document.createElement('div');
            cardActions.className = 'card-actions';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = '✏️ Edit';
            editBtn.onclick = () => editCard(actualIndex);
            cardActions.appendChild(editBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '🗑️';
            deleteBtn.onclick = () => deleteCard(actualIndex);
            cardActions.appendChild(deleteBtn);
            
            cardHeader.appendChild(cardActions);
        }
        
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.textContent = card.front;
        
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.textContent = card.back || '(No answer provided)';
        
        cardElement.appendChild(cardHeader);
        cardElement.appendChild(cardFront);
        cardElement.appendChild(cardBack);
        
        cardsGrid.appendChild(cardElement);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Add card form
    const addCardForm = document.getElementById('addCardForm');
    if (addCardForm) {
        addCardForm.addEventListener('submit', (e) => {
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
    }
    
    // Filter by category
    const filterCategory = document.getElementById('filterCategory');
    if (filterCategory) {
        filterCategory.addEventListener('change', (e) => {
            const searchTerm = document.getElementById('searchInput').value;
            displayCards(e.target.value, searchTerm);
        });
    }
    
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const filterCategory = document.getElementById('filterCategory').value;
            displayCards(filterCategory, e.target.value);
        });
    }
    
    // Practice mode buttons
    const startPracticeBtn = document.getElementById('startPracticeBtn');
    if (startPracticeBtn) {
        startPracticeBtn.addEventListener('click', startPracticeMode);
    }
    
    const exitPracticeBtn = document.getElementById('exitPracticeBtn');
    if (exitPracticeBtn) {
        exitPracticeBtn.addEventListener('click', exitPracticeMode);
    }
    
    const revealBtn = document.getElementById('revealBtn');
    if (revealBtn) {
        revealBtn.addEventListener('click', revealAnswer);
    }
    
    const knowItBtn = document.getElementById('knowItBtn');
    if (knowItBtn) {
        knowItBtn.addEventListener('click', markKnown);
    }
    
    const needReviewBtn = document.getElementById('needReviewBtn');
    if (needReviewBtn) {
        needReviewBtn.addEventListener('click', markReview);
    }
    
    // Export/Import buttons
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportCards);
    }
    
    const importBtn = document.getElementById('importBtn');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            const importFile = document.getElementById('importFile');
            if (importFile) {
                importFile.click();
            }
        });
    }
    
    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', importCards);
    }
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
    
    // Category selection
    const categories = ['Java', 'DSA', 'C', 'HTML', 'CSS', 'Other'];
    let categoryPrompt = 'Edit Category (enter number):\n';
    categories.forEach((cat, i) => {
        categoryPrompt += `${i + 1}. ${cat}${cat === card.category ? ' (current)' : ''}\n`;
    });
    
    const categoryChoice = prompt(categoryPrompt, categories.indexOf(card.category) + 1);
    if (categoryChoice === null) return;
    
    const categoryIndex = parseInt(categoryChoice) - 1;
    const newCategory = (categoryIndex >= 0 && categoryIndex < categories.length) 
        ? categories[categoryIndex] 
        : card.category;
    
    customCards[index] = {
        ...card,
        front: newFront.trim(),
        back: newBack.trim(),
        category: newCategory
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
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM is already ready
    init();
}

// Export cards as JSON
function exportCards() {
    const dataStr = JSON.stringify(customCards, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'codecards-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    alert('Cards exported! 📥\nYou can import this file in your extension.');
}

// Import cards from JSON
function importCards(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedCards = JSON.parse(event.target.result);
            
            if (!Array.isArray(importedCards)) {
                alert('Invalid file format!');
                return;
            }
            
            // Ask user what they want to do
            const choice = prompt(
                'Import Options:\n' +
                '1 - REPLACE all custom cards with imported ones\n' +
                '2 - ADD only NEW cards (skip duplicates)\n' +
                '3 - ADD ALL imported cards (merge with existing)\n\n' +
                'Enter 1, 2, or 3:',
                '1'
            );
            
            if (choice === null) return; // User cancelled
            
            if (choice === '1') {
                // Replace: overwrite all custom cards with imported ones
                customCards = importedCards;
                alert(`Replaced with ${importedCards.length} cards! 🎉`);
            } else if (choice === '2') {
                // Add only new cards (avoid duplicates)
                const existingFronts = new Set(customCards.map(card => 
                    `${card.front.toLowerCase()}|${card.back.toLowerCase()}`
                ));
                
                const newCards = importedCards.filter(card => {
                    const key = `${card.front.toLowerCase()}|${card.back.toLowerCase()}`;
                    return !existingFronts.has(key);
                });
                
                if (newCards.length === 0) {
                    alert('No new cards to add. All imported cards already exist.');
                    e.target.value = ''; // Reset file input
                    return;
                }
                
                customCards = [...customCards, ...newCards];
                alert(`Added ${newCards.length} new card(s)! 🎉\n(Skipped ${importedCards.length - newCards.length} duplicate(s))`);
            } else if (choice === '3') {
                // Merge: add all imported cards
                customCards = [...customCards, ...importedCards];
                alert(`Added ${importedCards.length} cards! 🎉`);
            } else {
                alert('Invalid choice. Import cancelled.');
                e.target.value = ''; // Reset file input
                return;
            }
            
            saveCards();
            loadCards();
            
        } catch (error) {
            alert('Error reading file! Make sure it\'s a valid JSON file.');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
}