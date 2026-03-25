// Menu data
const menuData = {
    'Subway': {
        'Block A': [
            { name: 'Subway Club', price: 150 },
            { name: 'Italian BMT', price: 140 },
            { name: 'burger', price: 130 },
            { name: 'Veggie Delite', price: 120 }
        ],
        'Block C': [
            { name: 'Chicken Teriyaki', price: 160 },
            { name: 'Tuna', price: 155 },
            { name: 'Roast Beef', price: 145 },
            { name: 'Ham', price: 135 }
        ]
    },
    'Canteen': {
        'Main': [
            { name: 'Pasta Alfredo', price: 80 },
            { name: 'Chicken Burger', price: 60 },
            { name: 'Veg Sandwich', price: 40 },
            { name: 'Coffee', price: 30 }
        ],
        'Hostel': [
            { name: 'Egg Fried Rice', price: 70 },
            { name: 'Paneer Tikka', price: 90 },
            { name: 'Dal Rice', price: 50 },
            { name: 'Tea', price: 20 }
        ]
    }
};

// Utility functions
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addItemToCart(item) {
    let cart = getCart();
    let existing = cart.find(i => i.name === item.name);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    saveCart(cart);
}

function addToCart(name, price) {
    addItemToCart({ name, price });
    // Show brief feedback
    showAddToCartFeedback();
}

function showAddToCartFeedback() {
    const feedback = document.createElement('div');
    feedback.textContent = 'Added to cart!';
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 25px;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(feedback);
    setTimeout(() => {
        feedback.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(feedback), 300);
    }, 2000);
}

function removeFromCart(name) {
    let cart = getCart();
    const index = cart.findIndex(item => item.name === name);
    if (index > -1) {
        cart.splice(index, 1);
        saveCart(cart);
        initCart(); // Refresh cart display
    }
}

function updateQuantity(name, change) {
    let cart = getCart();
    const index = cart.findIndex(item => item.name === name);
    if (index > -1) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart(cart);
        initCart(); // Refresh cart display
    }
}

function getTotal(cart) {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Page specific functions
function initLogin() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const userId = document.getElementById('userId').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const users = getUsers();
        const user = users.find(u => u.id === userId && u.password === password && u.role === role);
        if (user) {
            if (role === 'User') {
                window.location.href = 'brand.html';
            } else {
                alert('Admin functionality not implemented yet.');
            }
        } else {
            alert('Invalid credentials!');
        }
    });
}

function selectBrand(brand) {
    localStorage.setItem('brand', brand);
    window.location.href = 'shops.html';
}

function initShops() {
    const brand = localStorage.getItem('brand');
    if (!brand) {
        window.location.href = 'brand.html';
        return;
    }
    const shops = brand === 'Subway' ? ['Block A', 'Block C'] : ['Main', 'Hostel'];
    const shopsDiv = document.getElementById('shops');
    shops.forEach(shop => {
        const button = document.createElement('button');
        button.textContent = shop;
        button.onclick = () => selectShop(shop);
        shopsDiv.appendChild(button);
    });
}

function selectShop(shop) {
    localStorage.setItem('shop', shop);
    window.location.href = 'menu.html';
}

function getFoodEmoji(foodName) {
    const emojiMap = {
        'Subway Club': '🥪',
        'Italian BMT': '🥪',
        'burger': '🍔',
        'Veggie Delite': '🥬',
        'Chicken Teriyaki': '🍗',
        'Tuna': '🐟',
        'Roast Beef': '🥩',
        'Ham': '🍖',
        'Pasta Alfredo': '🍝',
        'Chicken Burger': '🍔',
        'Veg Sandwich': '🥪',
        'Coffee': '☕',
        'Egg Fried Rice': '🍚',
        'Paneer Tikka': '🍛',
        'Dal Rice': '🍛',
        'Tea': '🍵'
    };
    return emojiMap[foodName] || '🍽️';
}

function initMenu() {
    const brand = localStorage.getItem('brand');
    const shop = localStorage.getItem('shop');
    if (!brand || !shop) {
        window.location.href = 'brand.html';
        return;
    }
    const items = menuData[brand][shop];
    const menuDiv = document.getElementById('menu');
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
            <div class="food-image">
                <div class="image-placeholder">${getFoodEmoji(item.name)}</div>
            </div>
            <div class="food-details">
                <div class="food-name">${item.name}</div>
                <div class="food-price">₹${item.price}</div>
                <button onclick="addToCart('${item.name.replace(/'/g, "\\'")}', ${item.price})">Add to Cart</button>
            </div>
        `;
        menuDiv.appendChild(div);
    });
}

function goToCart() {
    window.location.href = 'cart.html';
}

function initCart() {
    const cart = getCart();
    const cartItemsDiv = document.getElementById('cartItems');
    const totalSpan = document.getElementById('total');
    if (cart.length === 0) {
        alert('Cart is empty!');
        window.location.href = 'menu.html';
        return;
    }
    cartItemsDiv.innerHTML = ''; // Clear existing items
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="food-image">
                <div class="image-placeholder">${getFoodEmoji(item.name)}</div>
            </div>
            <div class="food-details">
                <div class="food-name">${item.name}</div>
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="updateQuantity('${item.name.replace(/'/g, "\\'")}', -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.name.replace(/'/g, "\\'")}', 1)">+</button>
                </div>
                <div class="food-price">₹${item.price * item.quantity}</div>
                <button class="remove-btn" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')">Remove All</button>
            </div>
        `;
        cartItemsDiv.appendChild(div);
    });
    totalSpan.textContent = getTotal(cart);
}

function proceedToPayment() {
    window.location.href = 'payment.html';
}

function initSignup() {
    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const userId = document.getElementById('userId').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const users = getUsers();
        if (users.find(u => u.id === userId)) {
            alert('User ID already exists!');
            return;
        }
        users.push({ id: userId, password, role });
        saveUsers(users);
        alert('Sign up successful! Please login.');
        window.location.href = 'login.html';
    });
}

function initSuccess() {
    if (localStorage.getItem('paid') !== 'true') {
        window.location.href = 'payment.html';
        return;
    }
    const receipt = Math.random().toString(36).substr(2, 9).toUpperCase();
    document.getElementById('receipt').textContent = receipt;
    localStorage.removeItem('cart');
    localStorage.removeItem('paid');
}

// Initialize based on current page
window.onload = function() {
    const path = window.location.pathname;
    if (path.includes('login.html')) {
        initLogin();
    } else if (path.includes('signup.html')) {
        initSignup();
    } else if (path.includes('brand.html')) {
        // No init needed
    } else if (path.includes('shops.html')) {
        initShops();
    } else if (path.includes('menu.html')) {
        initMenu();
    } else if (path.includes('cart.html')) {
        initCart();
    } else if (path.includes('payment.html')) {
        // No init needed
    } else if (path.includes('success.html')) {
        initSuccess();
    }
};