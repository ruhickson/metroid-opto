// Canvas setup
const canvas = document.getElementById('map-canvas');
const ctx = canvas.getContext('2d');
const infoPanel = document.getElementById('info-panel');

// View state
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastX = 0;
let lastY = 0;

// Coordinate bounds
let minX = Infinity;
let maxX = -Infinity;
let minY = Infinity;
let maxY = -Infinity;

// Colors
const COLORS = {
    rooms: {
        Crateria: '#4a90e2',
        Brinstar: '#50e3c2',
        Norfair: '#e35050',
        WreckedShip: '#e3c250',
        Maridia: '#50e350',
        Tourian: '#e350e3'
    },
    items: {
        major: '#ffd700',
        missile: '#ff6b6b',
        energy: '#4caf50',
        reserve: '#2196f3',
        powerBomb: '#9c27b0',
        superMissile: '#ff9800',
        boss: '#ff0000',
        miniBoss: '#ff4500'
    },
    route: {
        line: '#ffffff',
        point: '#ffffff',
        current: '#00ff00'
    }
};

// Calculate coordinate bounds
function calculateBounds() {
    // Reset bounds
    minX = Infinity;
    maxX = -Infinity;
    minY = Infinity;
    maxY = -Infinity;

    // Check room coordinates
    rooms.features.forEach(room => {
        room.geometry.coordinates[0].forEach(([x, y]) => {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });
    });

    // Check item coordinates
    [majorItems, missiles, energyTanks, reserveTanks, powerBombs, superMissiles].forEach(items => {
        if (items && items.features) {
            items.features.forEach(item => {
                const [x, y] = item.geometry.coordinates;
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            });
        }
    });
}

// Initialize canvas size and scaling
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    
    // Calculate bounds if not already done
    if (minX === Infinity) {
        calculateBounds();
    }
    
    // Calculate scale to fit the map
    const mapWidth = maxX - minX;
    const mapHeight = maxY - minY;
    const scaleX = canvas.width / mapWidth;
    const scaleY = canvas.height / mapHeight;
    scale = Math.min(scaleX, scaleY) * 0.9; // 90% of the available space
    
    // Center the map
    offsetX = (canvas.width - mapWidth * scale) / 2;
    offsetY = (canvas.height - mapHeight * scale) / 2;
    
    draw();
}

// Transform coordinates from game space to screen space
function transformCoords(x, y) {
    return {
        x: (x - minX) * scale + offsetX,
        y: canvas.height - ((y - minY) * scale + offsetY) // Invert Y coordinate
    };
}

// Draw a room
function drawRoom(room) {
    const coords = room.geometry.coordinates[0].map(([x, y]) => transformCoords(x, y));
    
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(coords[i].x, coords[i].y);
    }
    ctx.closePath();
    
    const area = room.properties.area;
    ctx.fillStyle = COLORS.rooms[area] || '#666';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// Draw an item
function drawItem(item, type) {
    const [x, y] = item.geometry.coordinates;
    const coords = transformCoords(x, y);
    
    // Draw the item dot
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.items[type] || '#fff';
    ctx.fill();
    
    // Add text label
    ctx.font = '12px Arial';
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'middle';
    
    let label = '';
    if (type === 'major') {
        // For major items, show the full name to the left
        label = item.properties.item;
        ctx.textAlign = 'right';
        ctx.fillText(label, coords.x - 8, coords.y); // 8px to the left
    } else {
        // For other items, show the first letter above the dot
        label = item.properties.item.charAt(0);
        ctx.textAlign = 'center';
        ctx.fillText(label, coords.x, coords.y - 10);
    }
}

// Check if a point is inside a polygon
function pointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0], yi = polygon[i][1];
        const xj = polygon[j][0], yj = polygon[j][1];
        
        const intersect = ((yi > point[1]) !== (yj > point[1]))
            && (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// Find room at coordinates
function findRoomAt(x, y) {
    // Get canvas position relative to page
    const rect = canvas.getBoundingClientRect();
    
    // Convert mouse coordinates to canvas coordinates
    const canvasX = x - rect.left;
    const canvasY = y - rect.top;
    
    // Convert canvas coordinates to game coordinates
    const gameCoords = [
        (canvasX - offsetX) / scale + minX,
        (canvas.height - canvasY - offsetY) / scale + minY // Invert Y coordinate
    ];
    
    return rooms.features.find(room => {
        const polygon = room.geometry.coordinates[0];
        return pointInPolygon(gameCoords, polygon);
    });
}

// Draw a boss or mini-boss
function drawBoss(boss, isMini = false) {
    const [x, y] = boss.geometry.coordinates;
    const coords = transformCoords(x, y);
    
    // Draw a larger dot for bosses
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = isMini ? COLORS.items.miniBoss : COLORS.items.boss;
    ctx.fill();
    
    // Add text label
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    // Draw the boss name to the right of the dot
    ctx.fillText(boss.properties.boss, coords.x + 8, coords.y); // 8px to the right
}

// Draw route
function drawRoute() {
    if (!route) return;

    // Debug: log route coordinates
    console.log('Route start:', route.start.position);
    route.steps.forEach((step, i) => console.log(`Step ${i}:`, step.position));

    ctx.save();

    // Draw thick black outline first
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 12;
    ctx.beginPath();
    // Start at the first point
    let coords = transformCoords(route.start.position[0], route.start.position[1]);
    ctx.moveTo(coords.x, coords.y);
    // Draw lines through each step in order
    route.steps.forEach(step => {
        coords = transformCoords(step.position[0], step.position[1]);
        ctx.lineTo(coords.x, coords.y);
    });
    ctx.stroke();

    // Draw thick magenta line on top
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    coords = transformCoords(route.start.position[0], route.start.position[1]);
    ctx.moveTo(coords.x, coords.y);
    route.steps.forEach(step => {
        coords = transformCoords(step.position[0], step.position[1]);
        ctx.lineTo(coords.x, coords.y);
    });
    ctx.stroke();

    // Draw smaller cyan points with black outline at each step and start
    [route.start].concat(route.steps).forEach((step) => {
        const coords = transformCoords(step.position[0], step.position[1]);
        // Black outline
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        // Cyan fill
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffff';
        ctx.fill();
    });

    ctx.restore();
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw rooms
    rooms.features.forEach(drawRoom);
    
    // Draw items
    if (majorItems && majorItems.features) {
        majorItems.features.forEach(item => drawItem(item, 'major'));
    }
    if (missiles && missiles.features) {
        missiles.features.forEach(item => drawItem(item, 'missile'));
    }
    if (energyTanks && energyTanks.features) {
        energyTanks.features.forEach(item => drawItem(item, 'energy'));
    }
    if (reserveTanks && reserveTanks.features) {
        reserveTanks.features.forEach(item => drawItem(item, 'reserve'));
    }
    if (powerBombs && powerBombs.features) {
        powerBombs.features.forEach(item => drawItem(item, 'powerBomb'));
    }
    if (superMissiles && superMissiles.features) {
        superMissiles.features.forEach(item => drawItem(item, 'superMissile'));
    }
    
    // Draw bosses and mini-bosses
    if (bosses && bosses.features) {
        bosses.features.forEach(boss => drawBoss(boss, false));
    }
    if (miniBosses && miniBosses.features) {
        miniBosses.features.forEach(boss => drawBoss(boss, true));
    }

    // Draw route
    drawRoute();
}

// Event listeners
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        offsetX += e.clientX - lastX;
        offsetY += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        draw();
    }
    
    const room = findRoomAt(e.clientX, e.clientY);
    if (room) {
        infoPanel.style.display = 'block';
        infoPanel.innerHTML = `
            <h3>${room.properties.name}</h3>
            <p>Area: ${room.properties.area}</p>
            <a href="${room.properties.link}" target="_blank">View on Wiki</a>
        `;
    } else {
        infoPanel.style.display = 'none';
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    infoPanel.style.display = 'none';
});

// Zoom controls
document.getElementById('zoom-in').addEventListener('click', () => {
    scale *= 1.2;
    draw();
});

document.getElementById('zoom-out').addEventListener('click', () => {
    scale /= 1.2;
    draw();
});

document.getElementById('reset-view').addEventListener('click', () => {
    resizeCanvas();
});

// Handle window resize
window.addEventListener('resize', resizeCanvas);

// Initial setup
resizeCanvas(); 