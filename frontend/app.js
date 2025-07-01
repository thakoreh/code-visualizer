// Global variables
let editor;
let currentTrace = [];
let currentStep = 0;
let isPlaying = false;
let playInterval;
let previousVariables = {};
let dataStructureVisualizer;

// API Configuration
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://your-backend-url.com'; // Replace with your backend URL

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeEditor();
    initializeEventListeners();
    initializeDataStructureVisualizer();
    checkFirstVisit();
});

// Initialize CodeMirror editor
function initializeEditor() {
    editor = CodeMirror(document.getElementById('code-editor'), {
        mode: 'python',
        theme: 'monokai',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true,
        extraKeys: {
            'Tab': 'indentMore',
            'Shift-Tab': 'indentLess',
            'Ctrl-Enter': runCode,
            'Cmd-Enter': runCode
        }
    });

    // Set default code
    editor.setValue(`# Welcome to Code Visualizer Pro!
# Try this example or write your own code

def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# Test the function
numbers = [64, 34, 25, 12, 22, 11, 90]
print("Original array:", numbers)
sorted_numbers = bubble_sort(numbers)
print("Sorted array:", sorted_numbers)`);
}

// Initialize event listeners
function initializeEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Run button
    document.getElementById('run-btn').addEventListener('click', runCode);

    // Execution controls
    document.getElementById('play-pause-btn').addEventListener('click', togglePlayPause);
    document.getElementById('step-back-btn').addEventListener('click', stepBackward);
    document.getElementById('step-forward-btn').addEventListener('click', stepForward);
    document.getElementById('restart-btn').addEventListener('click', restart);

    // Speed slider
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    speedSlider.addEventListener('input', (e) => {
        speedValue.textContent = e.target.value;
        if (isPlaying) {
            stopPlaying();
            startPlaying();
        }
    });

    // Template selector
    document.getElementById('template-selector').addEventListener('change', loadTemplate);

    // Output tabs
    document.querySelectorAll('.output-tab').forEach(tab => {
        tab.addEventListener('click', () => switchOutputTab(tab.dataset.output));
    });

    // Pattern buttons
    document.querySelectorAll('.load-pattern').forEach(btn => {
        btn.addEventListener('click', () => loadPattern(btn.dataset.pattern));
    });

    // Problem categories
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => loadProblems(card.dataset.category));
    });
}

// Switch between main tabs
function switchTab(tabName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

// Switch between output tabs
function switchOutputTab(outputType) {
    document.querySelectorAll('.output-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.output === outputType);
    });

    document.querySelectorAll('.output-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `${outputType}-content`);
    });
}

// Run code
async function runCode() {
    const code = editor.getValue();
    if (!code.trim()) {
        showError('Please enter some code to run');
        return;
    }

    // Show loading
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.add('active');

    try {
        const response = await fetch(`${API_URL}/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code })
        });

        if (!response.ok) {
            throw new Error('Failed to execute code');
        }

        const result = await response.json();
        
        // Store trace data
        currentTrace = result.trace || [];
        currentStep = 0;
        previousVariables = {};

        // Update output panels
        document.getElementById('stdout-content').textContent = result.stdout || '';
        document.getElementById('stderr-content').textContent = result.stderr || '';
        
        // Display results
        displayResults(result.results || []);

        // Enable controls if we have trace data
        if (currentTrace.length > 0) {
            enableControls();
            visualizeStep(0);
            highlightCurrentLine(currentTrace[0].line);
        } else {
            disableControls();
        }

        // Analyze complexity
        analyzeComplexity(code);

        // Show appropriate output tab
        if (result.stderr) {
            switchOutputTab('stderr');
        } else {
            switchOutputTab('stdout');
        }

    } catch (error) {
        showError(error.message);
    } finally {
        loadingOverlay.classList.remove('active');
    }
}

// Visualization functions
function visualizeStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= currentTrace.length) return;

    const step = currentTrace[stepIndex];
    currentStep = stepIndex;

    // Update current line display
    const lineContent = getLineContent(step.line);
    const currentLineDisplay = document.getElementById('current-line-display');
    currentLineDisplay.textContent = lineContent;
    currentLineDisplay.style.animation = 'none';
    setTimeout(() => {
        currentLineDisplay.style.animation = '';
    }, 10);

    // Update variables
    visualizeVariables(step.locals);

    // Update call stack
    visualizeCallStack(step.call_stack);

    // Update data structures
    visualizeDataStructures(step.heap, step.locals);

    // Highlight current line in editor
    highlightCurrentLine(step.line);
}

// Get line content from editor
function getLineContent(lineNumber) {
    const line = editor.getLine(lineNumber - 1);
    return line || `Line ${lineNumber}`;
}

// Highlight current line in editor
function highlightCurrentLine(lineNumber) {
    // Remove previous highlights
    editor.eachLine((line) => {
        editor.removeLineClass(line, 'background', 'current-line');
    });

    // Add highlight to current line
    if (lineNumber > 0 && lineNumber <= editor.lineCount()) {
        editor.addLineClass(lineNumber - 1, 'background', 'current-line');
        editor.scrollIntoView({ line: lineNumber - 1, ch: 0 }, 100);
    }
}

// Visualize variables
function visualizeVariables(locals) {
    const container = document.getElementById('variables-viz');
    container.innerHTML = '';

    Object.entries(locals).forEach(([name, info]) => {
        const item = document.createElement('div');
        item.className = 'variable-item';

        // Check if variable changed
        const prevValue = previousVariables[name];
        if (prevValue !== undefined && JSON.stringify(prevValue) !== JSON.stringify(info)) {
            item.classList.add('changed');
        } else if (prevValue === undefined) {
            item.classList.add('new');
        }

        const nameSpan = document.createElement('span');
        nameSpan.className = 'variable-name';
        nameSpan.textContent = name;

        const valueSpan = document.createElement('span');
        valueSpan.className = 'variable-value';
        valueSpan.textContent = info.value || `→ heap`;

        const typeSpan = document.createElement('span');
        typeSpan.className = 'variable-type';
        typeSpan.textContent = ` (${info.type})`;

        item.appendChild(nameSpan);
        item.appendChild(valueSpan);
        item.appendChild(typeSpan);

        container.appendChild(item);
    });

    // Update previous variables
    previousVariables = { ...locals };
}

// Visualize call stack
function visualizeCallStack(callStack) {
    const container = document.getElementById('call-stack-viz');
    container.innerHTML = '';

    callStack.forEach((frame, index) => {
        const frameDiv = document.createElement('div');
        frameDiv.className = 'stack-frame';
        
        if (index === callStack.length - 1) {
            frameDiv.classList.add('active');
        }

        const functionName = document.createElement('div');
        functionName.className = 'stack-function';
        functionName.textContent = frame.function === '<module>' ? 'main()' : `${frame.function}()`;

        frameDiv.appendChild(functionName);
        container.appendChild(frameDiv);
    });
}

// Initialize data structure visualizer
function initializeDataStructureVisualizer() {
    const canvas = document.getElementById('viz-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    dataStructureVisualizer = new DataStructureVisualizer(canvas, ctx);
}

// Visualize data structures
function visualizeDataStructures(heap, locals) {
    if (!dataStructureVisualizer) return;

    // Find arrays, lists, and other data structures
    const structures = [];

    Object.entries(locals).forEach(([name, info]) => {
        if (info.id && heap[info.id]) {
            const heapObj = heap[info.id];
            structures.push({
                name,
                type: heapObj.type,
                data: parseDataStructure(heapObj.preview)
            });
        }
    });

    dataStructureVisualizer.visualize(structures);
}

// Parse data structure from string representation
function parseDataStructure(preview) {
    try {
        // Remove quotes and parse
        if (preview.startsWith('[') && preview.endsWith(']')) {
            return JSON.parse(preview.replace(/'/g, '"'));
        } else if (preview.startsWith('{') && preview.endsWith('}')) {
            return JSON.parse(preview.replace(/'/g, '"'));
        }
    } catch (e) {
        // If parsing fails, return the preview as is
    }
    return preview;
}

// Playback controls
function togglePlayPause() {
    if (isPlaying) {
        stopPlaying();
    } else {
        startPlaying();
    }
}

function startPlaying() {
    if (currentStep >= currentTrace.length - 1) {
        currentStep = 0;
    }

    isPlaying = true;
    const btn = document.getElementById('play-pause-btn');
    btn.innerHTML = '<i class="fas fa-pause"></i>';

    const speed = parseInt(document.getElementById('speed-slider').value);
    const delay = 1100 - (speed * 100); // Convert speed to delay

    playInterval = setInterval(() => {
        if (currentStep < currentTrace.length - 1) {
            stepForward();
        } else {
            stopPlaying();
        }
    }, delay);
}

function stopPlaying() {
    isPlaying = false;
    const btn = document.getElementById('play-pause-btn');
    btn.innerHTML = '<i class="fas fa-play"></i>';
    
    if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
    }
}

function stepBackward() {
    if (currentStep > 0) {
        visualizeStep(currentStep - 1);
    }
}

function stepForward() {
    if (currentStep < currentTrace.length - 1) {
        visualizeStep(currentStep + 1);
    }
}

function restart() {
    stopPlaying();
    currentStep = 0;
    if (currentTrace.length > 0) {
        visualizeStep(0);
    }
}

// Enable/disable controls
function enableControls() {
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.disabled = false;
    });
}

function disableControls() {
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.disabled = true;
    });
    stopPlaying();
}

// Display results
function displayResults(results) {
    const container = document.getElementById('results-content');
    container.innerHTML = '';

    results.forEach(result => {
        const item = document.createElement('div');
        item.className = 'result-item';

        const step = document.createElement('span');
        step.className = 'result-step';
        step.textContent = `Step ${result.step}`;

        const value = document.createElement('span');
        value.className = 'result-value';
        value.textContent = `Return: ${result.value}`;

        item.appendChild(step);
        item.appendChild(value);
        container.appendChild(item);
    });
}

// Show error message
function showError(message) {
    document.getElementById('stderr-content').textContent = message;
    switchOutputTab('stderr');
}

// Check first visit
function checkFirstVisit() {
    if (!localStorage.getItem('hasVisited')) {
        document.getElementById('tutorial-overlay').classList.add('active');
        localStorage.setItem('hasVisited', 'true');
    }
}

// Close tutorial
window.closeTutorial = function() {
    document.getElementById('tutorial-overlay').classList.remove('active');
};