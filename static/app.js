class CodeVisualizer {
    constructor() {
        this.trace = [];
        this.currentStep = 0;
        this.isPlaying = false;
        this.playInterval = null;
        this.speed = 800; // milliseconds
        this.memoryChart = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupTheme();
        this.loadExampleCode();
    }
    
    initializeElements() {
        // Main elements
        this.codeInput = document.getElementById('codeInput');
        this.runButton = document.getElementById('runCode');
        this.clearButton = document.getElementById('clearCode');
        this.loadExampleButton = document.getElementById('loadExample');
        
        // Visualization elements
        this.highlightedCode = document.getElementById('highlightedCode');
        this.executionPointer = document.getElementById('executionPointer');
        this.currentStepSpan = document.getElementById('currentStep');
        this.totalStepsSpan = document.getElementById('totalSteps');
        this.executionTimeSpan = document.getElementById('executionTime');
        this.currentLineSpan = document.getElementById('currentLine');
        
        // Playback controls
        this.stepBackButton = document.getElementById('stepBack');
        this.playPauseButton = document.getElementById('playPause');
        this.stepForwardButton = document.getElementById('stepForward');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedDisplay = document.getElementById('speedDisplay');
        
        // Panel content areas
        this.variablesContent = document.getElementById('variablesContent');
        this.heapContent = document.getElementById('heapContent');
        this.stackContent = document.getElementById('stackContent');
        this.outputContent = document.getElementById('outputContent');
        
        // Interview mode elements
        this.interviewModeButton = document.getElementById('interviewMode');
        this.interviewPanel = document.getElementById('interviewPanel');
        this.closeInterviewButton = document.getElementById('closeInterview');
        
        // Loading and error elements
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorModal = document.getElementById('errorModal');
        this.errorMessage = document.getElementById('errorMessage');
        this.closeErrorButton = document.getElementById('closeError');
        
        // Theme toggle
        this.toggleThemeButton = document.getElementById('toggleTheme');
    }
    
    setupEventListeners() {
        // Code execution
        this.runButton.addEventListener('click', () => this.runCode());
        this.clearButton.addEventListener('click', () => this.clearCode());
        this.loadExampleButton.addEventListener('click', () => this.loadExampleCode());
        
        // Playback controls
        this.stepBackButton.addEventListener('click', () => this.stepBack());
        this.playPauseButton.addEventListener('click', () => this.togglePlayPause());
        this.stepForwardButton.addEventListener('click', () => this.stepForward());
        this.speedSlider.addEventListener('input', (e) => this.updateSpeed(e.target.value));
        
        // Interview mode
        this.interviewModeButton.addEventListener('click', () => this.toggleInterviewMode());
        this.closeInterviewButton.addEventListener('click', () => this.closeInterviewMode());
        
        // Panel toggles
        document.querySelectorAll('.panel-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => this.togglePanel(e.target.dataset.panel));
        });
        
        // Error modal
        this.closeErrorButton.addEventListener('click', () => this.closeErrorModal());
        
        // Theme toggle
        this.toggleThemeButton.addEventListener('click', () => this.toggleTheme());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Code input auto-resize
        this.codeInput.addEventListener('input', () => this.autoResizeTextarea());
    }
    
    setupTheme() {
        const savedTheme = localStorage.getItem('codeVisualizer_theme') || 'light';
        this.setTheme(savedTheme);
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('codeVisualizer_theme', theme);
        
        const icon = this.toggleThemeButton.querySelector('i');
        const text = this.toggleThemeButton.querySelector('span') || this.toggleThemeButton.childNodes[1];
        
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            if (text) text.textContent = ' Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            if (text) text.textContent = ' Dark Mode';
        }
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    loadExampleCode() {
        const examples = [
            {
                name: "Bubble Sort",
                code: `# Example: Bubble Sort Algorithm
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# Test the algorithm
numbers = [64, 34, 25, 12, 22, 11, 90]
print("Original array:", numbers)
sorted_numbers = bubble_sort(numbers.copy())
print("Sorted array:", sorted_numbers)`
            },
            {
                name: "Binary Search",
                code: `# Example: Binary Search Algorithm
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# Test the algorithm
sorted_array = [1, 3, 5, 7, 9, 11, 13, 15]
target = 7
print(f"Array: {sorted_array}")
print(f"Searching for: {target}")
result = binary_search(sorted_array, target)
print(f"Found at index: {result}")`
            },
            {
                name: "Fibonacci Sequence",
                code: `# Example: Fibonacci Sequence
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

def fibonacci_iterative(n):
    if n <= 1:
        return n
    
    a, b = 0, 1
    for i in range(2, n + 1):
        a, b = b, a + b
    return b

# Test both approaches
n = 8
print(f"Fibonacci({n}) recursive: {fibonacci(n)}")
print(f"Fibonacci({n}) iterative: {fibonacci_iterative(n)}")

# Generate sequence
sequence = [fibonacci_iterative(i) for i in range(10)]
print(f"First 10 Fibonacci numbers: {sequence}")`
            }
        ];
        
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        this.codeInput.value = randomExample.code;
        this.autoResizeTextarea();
        
        // Show a brief notification
        this.showNotification(`Loaded example: ${randomExample.name}`, 'info');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: var(--${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'}-color);
            color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 3000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    autoResizeTextarea() {
        this.codeInput.style.height = 'auto';
        this.codeInput.style.height = Math.max(400, this.codeInput.scrollHeight) + 'px';
    }
    
    async runCode() {
        const code = this.codeInput.value.trim();
        if (!code) {
            this.showNotification('Please enter some code to execute', 'error');
            return;
        }
        
        this.showLoading(true);
        this.resetVisualization();
        
        try {
            const response = await fetch('/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    analyze_complexity: true,
                    track_performance: true
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.handleExecutionResult(data);
            
        } catch (error) {
            console.error('Execution error:', error);
            this.showError(`Failed to execute code: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }
    
    handleExecutionResult(data) {
        if (data.stderr && data.stderr.trim()) {
            this.showError(data.stderr);
            return;
        }
        
        this.trace = data.trace || [];
        this.currentStep = 0;
        
        // Update UI
        this.updateCodeDisplay(data.code_lines || []);
        this.updateOutput(data.stdout, data.stderr);
        this.updateStepInfo();
        this.updatePlaybackControls();
        
        // Update interview mode if active
        if (this.interviewPanel.classList.contains('active')) {
            this.updateInterviewAnalysis(data);
        }
        
        // Show first step if available
        if (this.trace.length > 0) {
            this.showStep(0);
            this.showNotification(`Execution complete! ${this.trace.length} steps recorded`, 'success');
        } else {
            this.showNotification('Code executed but no trace data available', 'info');
        }
    }
    
    updateCodeDisplay(codeLines) {
        if (codeLines.length === 0) {
            codeLines = this.codeInput.value.split('\n');
        }
        
        const numberedCode = codeLines.map((line, index) => 
            `<span class="line-number" data-line="${index + 1}">${(index + 1).toString().padStart(3, ' ')}</span><span class="line-content">${this.escapeHtml(line)}</span>`
        ).join('\n');
        
        this.highlightedCode.innerHTML = numberedCode;
        
        // Apply syntax highlighting
        if (window.Prism) {
            Prism.highlightElement(this.highlightedCode);
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.trace.length) return;
        
        this.currentStep = stepIndex;
        const step = this.trace[stepIndex];
        
        // Update step info
        this.updateStepInfo();
        
        // Highlight current line
        this.highlightCurrentLine(step.line);
        
        // Update panels
        this.updateVariablesPanel(step.locals || {});
        this.updateHeapPanel(step.heap || {});
        this.updateCallStackPanel(step.call_stack || []);
        
        // Move execution pointer
        this.moveExecutionPointer(step.line);
        
        // Update current line display
        this.currentLineSpan.textContent = step.line || 'N/A';
        this.executionTimeSpan.textContent = (step.timestamp || 0).toFixed(3) + 's';
    }
    
    highlightCurrentLine(lineNumber) {
        // Remove previous highlights
        document.querySelectorAll('.line-highlight').forEach(el => {
            el.classList.remove('line-highlight');
        });
        
        // Add highlight to current line
        const lineElement = document.querySelector(`[data-line="${lineNumber}"]`);
        if (lineElement) {
            const lineContainer = lineElement.parentElement;
            lineContainer.classList.add('line-highlight');
            
            // Scroll into view
            lineContainer.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
    
    moveExecutionPointer(lineNumber) {
        const lineElement = document.querySelector(`[data-line="${lineNumber}"]`);
        if (lineElement) {
            const rect = lineElement.getBoundingClientRect();
            const containerRect = this.highlightedCode.getBoundingClientRect();
            
            const top = rect.top - containerRect.top + this.highlightedCode.scrollTop;
            
            this.executionPointer.style.top = `${top}px`;
            this.executionPointer.style.display = 'block';
        } else {
            this.executionPointer.style.display = 'none';
        }
    }
    
    updateVariablesPanel(locals) {
        if (Object.keys(locals).length === 0) {
            this.variablesContent.innerHTML = '<div class="no-data">No variables to display</div>';
            return;
        }
        
        const variablesHtml = Object.entries(locals).map(([name, info]) => {
            const value = info.value !== undefined ? info.value : `<ref:${info.id}>`;
            return `
                <div class="variable-item">
                    <div>
                        <span class="variable-name">${name}</span>
                        <span class="variable-type">${info.type}</span>
                    </div>
                    <span class="variable-value">${this.escapeHtml(value)}</span>
                </div>
            `;
        }).join('');
        
        this.variablesContent.innerHTML = variablesHtml;
    }
    
    updateHeapPanel(heap) {
        if (Object.keys(heap).length === 0) {
            this.heapContent.innerHTML = '<div class="no-data">No heap objects to display</div>';
            return;
        }
        
        const heapHtml = Object.entries(heap).map(([id, obj]) => `
            <div class="heap-item">
                <div class="heap-id">ID: ${id}</div>
                <div class="heap-type">${obj.type}</div>
                <div class="heap-preview">${this.escapeHtml(obj.preview)}</div>
                ${obj.size !== undefined ? `<div class="heap-size">Size: ${obj.size}</div>` : ''}
            </div>
        `).join('');
        
        this.heapContent.innerHTML = heapHtml;
    }
    
    updateCallStackPanel(callStack) {
        if (callStack.length === 0) {
            this.stackContent.innerHTML = '<div class="no-data">No call stack to display</div>';
            return;
        }
        
        const stackHtml = callStack.map((frame, index) => `
            <div class="stack-frame">
                <div class="stack-function">${frame.function}</div>
                <div class="stack-line">Line: ${frame.line_number || 'N/A'}</div>
                <div class="stack-locals">${Object.keys(frame.locals || {}).length} local variables</div>
            </div>
        `).join('');
        
        this.stackContent.innerHTML = stackHtml;
    }
    
    updateOutput(stdout, stderr) {
        let outputHtml = '';
        
        if (stdout && stdout.trim()) {
            outputHtml += `<div class="output-stdout">${this.escapeHtml(stdout)}</div>`;
        }
        
        if (stderr && stderr.trim()) {
            outputHtml += `<div class="output-stderr">${this.escapeHtml(stderr)}</div>`;
        }
        
        if (!outputHtml) {
            outputHtml = '<div class="no-data">No output</div>';
        }
        
        this.outputContent.innerHTML = outputHtml;
    }
    
    updateStepInfo() {
        this.currentStepSpan.textContent = this.currentStep + 1;
        this.totalStepsSpan.textContent = this.trace.length;
    }
    
    updatePlaybackControls() {
        this.stepBackButton.disabled = this.currentStep <= 0;
        this.stepForwardButton.disabled = this.currentStep >= this.trace.length - 1;
        
        if (this.trace.length === 0) {
            this.playPauseButton.disabled = true;
            this.stepBackButton.disabled = true;
            this.stepForwardButton.disabled = true;
        } else {
            this.playPauseButton.disabled = false;
        }
    }
    
    stepBack() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
            this.updatePlaybackControls();
        }
    }
    
    stepForward() {
        if (this.currentStep < this.trace.length - 1) {
            this.showStep(this.currentStep + 1);
            this.updatePlaybackControls();
        }
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.pausePlayback();
        } else {
            this.startPlayback();
        }
    }
    
    startPlayback() {
        if (this.trace.length === 0) return;
        
        this.isPlaying = true;
        this.playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        
        this.playInterval = setInterval(() => {
            if (this.currentStep < this.trace.length - 1) {
                this.stepForward();
            } else {
                this.pausePlayback();
            }
        }, this.speed);
    }
    
    pausePlayback() {
        this.isPlaying = false;
        this.playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
    }
    
    updateSpeed(value) {
        this.speed = parseInt(value);
        this.speedDisplay.textContent = (this.speed / 1000).toFixed(1) + 's';
        
        // Restart playback with new speed if currently playing
        if (this.isPlaying) {
            this.pausePlayback();
            this.startPlayback();
        }
    }
    
    toggleInterviewMode() {
        this.interviewPanel.classList.toggle('active');
        
        if (this.interviewPanel.classList.contains('active')) {
            this.interviewModeButton.innerHTML = '<i class="fas fa-briefcase"></i> Exit Interview Mode';
        } else {
            this.interviewModeButton.innerHTML = '<i class="fas fa-briefcase"></i> Interview Mode';
        }
    }
    
    closeInterviewMode() {
        this.interviewPanel.classList.remove('active');
        this.interviewModeButton.innerHTML = '<i class="fas fa-briefcase"></i> Interview Mode';
    }
    
    updateInterviewAnalysis(data) {
        // Update complexity metrics
        const complexity = data.complexity_analysis || {};
        document.getElementById('cyclomaticComplexity').textContent = complexity.cyclomatic_complexity || '-';
        document.getElementById('nestingDepth').textContent = complexity.nesting_depth || '-';
        document.getElementById('qualityScore').textContent = (data.interview_insights?.code_quality_score || '-') + (typeof data.interview_insights?.code_quality_score === 'number' ? '/100' : '');
        
        // Update performance insights
        this.updatePerformanceInsights(data.performance_metrics || {});
        
        // Update interview tips
        this.updateInterviewTips(data.interview_insights || {}, complexity);
        
        // Update memory chart
        this.updateMemoryChart(data.performance_metrics?.memory_usage_pattern || []);
    }
    
    updatePerformanceInsights(metrics) {
        const container = document.getElementById('performanceInsights');
        
        if (!metrics.total_steps) {
            container.innerHTML = '<div class="no-data">Run code to see performance analysis</div>';
            return;
        }
        
        let html = `
            <div class="insight-item">
                <strong>Total Steps:</strong> ${metrics.total_steps}
            </div>
        `;
        
        if (metrics.hotspots && metrics.hotspots.length > 0) {
            html += '<div class="insight-section"><h5>Performance Hotspots:</h5>';
            metrics.hotspots.forEach(hotspot => {
                html += `<div class="hotspot-item">Line ${hotspot.line}: ${hotspot.executions} executions</div>`;
            });
            html += '</div>';
        }
        
        if (metrics.efficiency_tips && metrics.efficiency_tips.length > 0) {
            html += '<div class="insight-section"><h5>Efficiency Tips:</h5>';
            metrics.efficiency_tips.forEach(tip => {
                html += `<div class="tip-item"><i class="fas fa-lightbulb"></i> ${tip}</div>`;
            });
            html += '</div>';
        }
        
        container.innerHTML = html;
    }
    
    updateInterviewTips(insights, complexity) {
        const container = document.getElementById('interviewTips');
        
        let tips = [];
        
        // Add tips based on complexity analysis
        if (complexity.algorithms_detected && complexity.algorithms_detected.length > 0) {
            tips.push(`Algorithms detected: ${complexity.algorithms_detected.join(', ')}`);
        }
        
        if (complexity.time_complexity_hints && complexity.time_complexity_hints.length > 0) {
            tips.push(...complexity.time_complexity_hints.map(hint => `Time Complexity: ${hint}`));
        }
        
        if (complexity.space_complexity_hints && complexity.space_complexity_hints.length > 0) {
            tips.push(...complexity.space_complexity_hints.map(hint => `Space Complexity: ${hint}`));
        }
        
        // Add readability tips
        if (insights.readability_tips && insights.readability_tips.length > 0) {
            tips.push(...insights.readability_tips.map(tip => `Readability: ${tip}`));
        }
        
        // Add optimization suggestions
        if (insights.optimization_suggestions && insights.optimization_suggestions.length > 0) {
            tips.push(...insights.optimization_suggestions.map(tip => `Optimization: ${tip}`));
        }
        
        // Add common patterns
        if (insights.common_patterns && insights.common_patterns.length > 0) {
            tips.push(`Common patterns: ${insights.common_patterns.join(', ')}`);
        }
        
        if (tips.length === 0) {
            container.innerHTML = '<div class="no-data">Run code to get interview preparation tips</div>';
            return;
        }
        
        const html = tips.map(tip => `
            <div class="tip-item">
                <i class="fas fa-check-circle"></i>
                ${tip}
            </div>
        `).join('');
        
        container.innerHTML = html;
    }
    
    updateMemoryChart(memoryData) {
        const canvas = document.getElementById('memoryChart');
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart
        if (this.memoryChart) {
            this.memoryChart.destroy();
        }
        
        if (memoryData.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#666';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No memory data available', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const steps = memoryData.map(d => d.step);
        const heapObjects = memoryData.map(d => d.heap_objects);
        const localVars = memoryData.map(d => d.local_variables);
        
        this.memoryChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: steps,
                datasets: [{
                    label: 'Heap Objects',
                    data: heapObjects,
                    borderColor: '#17a2b8',
                    backgroundColor: 'rgba(23, 162, 184, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Local Variables',
                    data: localVars,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Count'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Execution Step'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Memory Usage Over Time'
                    }
                }
            }
        });
    }
    
    togglePanel(panelName) {
        const content = document.querySelector(`#${panelName}Content`);
        const toggle = document.querySelector(`[data-panel="${panelName}"]`);
        const icon = toggle.querySelector('i');
        
        content.classList.toggle('collapsed');
        
        if (content.classList.contains('collapsed')) {
            icon.className = 'fas fa-chevron-down';
        } else {
            icon.className = 'fas fa-chevron-up';
        }
    }
    
    clearCode() {
        this.codeInput.value = '';
        this.resetVisualization();
        this.autoResizeTextarea();
    }
    
    resetVisualization() {
        this.trace = [];
        this.currentStep = 0;
        this.pausePlayback();
        
        // Reset displays
        this.highlightedCode.innerHTML = '';
        this.executionPointer.style.display = 'none';
        this.currentStepSpan.textContent = '0';
        this.totalStepsSpan.textContent = '0';
        this.executionTimeSpan.textContent = '0.00s';
        this.currentLineSpan.textContent = 'N/A';
        
        // Reset panels
        this.variablesContent.innerHTML = '<div class="no-data">No variables to display</div>';
        this.heapContent.innerHTML = '<div class="no-data">No heap objects to display</div>';
        this.stackContent.innerHTML = '<div class="no-data">No call stack to display</div>';
        this.outputContent.innerHTML = '<div class="no-data">No output</div>';
        
        // Reset controls
        this.updatePlaybackControls();
        
        // Clear interview analysis
        if (this.interviewPanel.classList.contains('active')) {
            document.getElementById('cyclomaticComplexity').textContent = '-';
            document.getElementById('nestingDepth').textContent = '-';
            document.getElementById('qualityScore').textContent = '-';
            document.getElementById('performanceInsights').innerHTML = '<div class="no-data">Run code to see performance analysis</div>';
            document.getElementById('interviewTips').innerHTML = '<div class="no-data">Run code to get interview preparation tips</div>';
            
            if (this.memoryChart) {
                this.memoryChart.destroy();
                this.memoryChart = null;
            }
        }
    }
    
    showLoading(show) {
        this.loadingOverlay.style.display = show ? 'flex' : 'none';
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorModal.style.display = 'flex';
    }
    
    closeErrorModal() {
        this.errorModal.style.display = 'none';
    }
    
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter: Run code
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.runCode();
        }
        
        // Space: Play/Pause (when not in input)
        if (e.key === ' ' && e.target !== this.codeInput) {
            e.preventDefault();
            this.togglePlayPause();
        }
        
        // Arrow keys: Step through execution
        if (e.target !== this.codeInput) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.stepBack();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.stepForward();
            }
        }
        
        // Escape: Close modals/panels
        if (e.key === 'Escape') {
            if (this.errorModal.style.display === 'flex') {
                this.closeErrorModal();
            } else if (this.interviewPanel.classList.contains('active')) {
                this.closeInterviewMode();
            }
        }
        
        // F1: Toggle interview mode
        if (e.key === 'F1') {
            e.preventDefault();
            this.toggleInterviewMode();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CodeVisualizer();
});

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .insight-section {
        margin: 1rem 0;
    }
    
    .insight-section h5 {
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--primary-color);
    }
    
    .insight-item, .hotspot-item, .tip-item {
        padding: 0.5rem;
        margin: 0.25rem 0;
        background: var(--bg-color);
        border-radius: 4px;
        font-size: 0.875rem;
    }
    
    .tip-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .tip-item i {
        color: var(--success-color);
    }
    
    .hotspot-item {
        border-left: 3px solid var(--warning-color);
        padding-left: 0.75rem;
    }
    
    .line-number {
        display: inline-block;
        width: 3em;
        color: var(--text-muted);
        user-select: none;
        margin-right: 1em;
    }
    
    .line-content {
        white-space: pre;
    }
`;
document.head.appendChild(style);