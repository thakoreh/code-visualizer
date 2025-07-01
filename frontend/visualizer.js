// Data Structure Visualizer Class
class DataStructureVisualizer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.animations = [];
        this.colors = {
            primary: '#6366f1',
            secondary: '#8b5cf6',
            accent: '#ec4899',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            text: '#f1f5f9',
            bg: '#1e293b',
            border: '#475569'
        };
    }

    visualize(structures) {
        this.clear();
        
        if (structures.length === 0) {
            this.drawEmptyState();
            return;
        }

        // Visualize each structure
        structures.forEach((structure, index) => {
            const y = 50 + (index * 150);
            
            switch (structure.type) {
                case 'list':
                    this.visualizeArray(structure.data, structure.name, 50, y);
                    break;
                case 'dict':
                    this.visualizeDict(structure.data, structure.name, 50, y);
                    break;
                case 'set':
                    this.visualizeSet(structure.data, structure.name, 50, y);
                    break;
                default:
                    this.visualizeGeneric(structure.data, structure.name, 50, y);
            }
        });

        // Run animations
        this.animate();
    }

    clear() {
        this.ctx.fillStyle = this.colors.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawEmptyState() {
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('No data structures to visualize', this.canvas.width / 2, this.canvas.height / 2);
    }

    visualizeArray(data, name, x, y) {
        if (!Array.isArray(data)) return;

        const cellWidth = 60;
        const cellHeight = 40;
        const padding = 10;

        // Draw label
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(name + ':', x, y - 10);

        // Draw array cells
        data.forEach((value, index) => {
            const cellX = x + (index * (cellWidth + padding));
            
            // Add entrance animation
            this.animations.push({
                type: 'fadeIn',
                x: cellX,
                y: y,
                width: cellWidth,
                height: cellHeight,
                delay: index * 50,
                duration: 500,
                startTime: Date.now()
            });

            // Draw cell
            this.drawCell(cellX, y, cellWidth, cellHeight, value, index);
        });

        // Draw array brackets
        this.drawArrayBrackets(x - 10, y, data.length * (cellWidth + padding) - padding + 20, cellHeight);
    }

    drawCell(x, y, width, height, value, index) {
        // Cell background with gradient
        const gradient = this.ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, this.colors.primary);
        gradient.addColorStop(1, this.colors.secondary);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, width, height);

        // Cell border
        this.ctx.strokeStyle = this.colors.border;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);

        // Cell value
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(String(value), x + width / 2, y + height / 2);

        // Index label
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '12px Arial';
        this.ctx.fillText(index, x + width / 2, y + height + 15);
    }

    drawArrayBrackets(x, y, width, height) {
        this.ctx.strokeStyle = this.colors.accent;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';

        // Left bracket
        this.ctx.beginPath();
        this.ctx.moveTo(x + 5, y);
        this.ctx.lineTo(x, y);
        this.ctx.lineTo(x, y + height);
        this.ctx.lineTo(x + 5, y + height);
        this.ctx.stroke();

        // Right bracket
        this.ctx.beginPath();
        this.ctx.moveTo(x + width - 5, y);
        this.ctx.lineTo(x + width, y);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.lineTo(x + width - 5, y + height);
        this.ctx.stroke();
    }

    visualizeDict(data, name, x, y) {
        const cellWidth = 120;
        const cellHeight = 40;
        const padding = 20;

        // Draw label
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(name + ':', x, y - 10);

        // Draw dict entries
        let index = 0;
        for (const [key, value] of Object.entries(data)) {
            const cellX = x + (index * (cellWidth + padding));
            
            // Draw key-value pair
            this.drawDictEntry(cellX, y, cellWidth, cellHeight, key, value);
            index++;
        }
    }

    drawDictEntry(x, y, width, height, key, value) {
        // Background
        this.ctx.fillStyle = this.colors.bg;
        this.ctx.fillRect(x, y, width, height);

        // Border with rounded corners
        this.drawRoundedRect(x, y, width, height, 5);
        this.ctx.strokeStyle = this.colors.primary;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Key
        this.ctx.fillStyle = this.colors.accent;
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(String(key), x + width / 4, y + height / 2);

        // Arrow
        this.ctx.strokeStyle = this.colors.text;
        this.ctx.beginPath();
        this.ctx.moveTo(x + width / 2 - 10, y + height / 2);
        this.ctx.lineTo(x + width / 2 + 10, y + height / 2);
        this.ctx.moveTo(x + width / 2 + 5, y + height / 2 - 5);
        this.ctx.lineTo(x + width / 2 + 10, y + height / 2);
        this.ctx.lineTo(x + width / 2 + 5, y + height / 2 + 5);
        this.ctx.stroke();

        // Value
        this.ctx.fillStyle = this.colors.success;
        this.ctx.fillText(String(value), x + 3 * width / 4, y + height / 2);
    }

    visualizeSet(data, name, x, y) {
        // Convert set string to array
        const items = data.slice(1, -1).split(', ');
        
        // Draw as circular nodes
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(name + ':', x, y - 10);

        const radius = 25;
        const padding = 20;

        items.forEach((item, index) => {
            const centerX = x + radius + (index * (radius * 2 + padding));
            const centerY = y + radius;

            // Draw circle
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.colors.warning;
            this.ctx.fill();
            this.ctx.strokeStyle = this.colors.border;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw value
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(item.replace(/'/g, ''), centerX, centerY);
        });
    }

    visualizeGeneric(data, name, x, y) {
        // For other types, just display as text
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`${name}: ${data}`, x, y);
    }

    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    animate() {
        const now = Date.now();
        let hasActiveAnimations = false;

        this.animations = this.animations.filter(anim => {
            const elapsed = now - anim.startTime - anim.delay;
            
            if (elapsed < 0) {
                hasActiveAnimations = true;
                return true; // Animation hasn't started yet
            }

            const progress = Math.min(elapsed / anim.duration, 1);
            
            if (progress < 1) {
                hasActiveAnimations = true;
                
                // Apply animation
                if (anim.type === 'fadeIn') {
                    this.ctx.globalAlpha = progress;
                }
            }

            return progress < 1;
        });

        if (hasActiveAnimations) {
            requestAnimationFrame(() => this.animate());
        }
    }
}

// Export for use in main app
window.DataStructureVisualizer = DataStructureVisualizer;