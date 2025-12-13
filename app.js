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

// Initialize app
function init() {
    loadCards();
    setupEventListeners();
}

// Load cards from chrome.storage (syncs with newtab extension)
function loadCards() {
    // Check if chrome.storage is available (Chrome extension context)
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['customCards'], (result) => {
            customCards = result.customCards || [];
            allCards = [...defaultCards, ...customCards];
            updateStats();
            displayCards();
        });
    } else {
        // Fallback to localStorage for standalone web version
        const stored = localStorage.getItem('flashcards');
        customCards = stored ? JSON.parse(stored) : [];
        allCards = [...defaultCards, ...customCards];
        updateStats();
        displayCards();
    }
}

// Save cards to chrome.storage (syncs with newtab extension)
function saveCards(callback) {
    // Check if chrome.storage is available (Chrome extension context)
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ customCards }, () => {
            if (callback) callback();
        });
    } else {
        // Fallback to localStorage for standalone web version
        localStorage.setItem('flashcards', JSON.stringify(customCards));
        if (callback) callback();
    }
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
        saveCards(() => {
            loadCards();
            // Clear form
            document.getElementById('addCardForm').reset();
            // Show success message
            alert('Card added successfully! 🎉');
        });
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
    
    saveCards(() => {
        loadCards();
        alert('Card updated! ✅');
    });
};

// Delete card
window.deleteCard = function(index) {
    if (confirm('Delete this card?')) {
        customCards.splice(index, 1);
        saveCards(() => {
            loadCards();
            alert('Card deleted! 🗑️');
        });
    }
};

// Initialize when page loads
init();