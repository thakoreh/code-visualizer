# Code Visualizer Pro - Frontend

An enhanced code visualization tool designed specifically for coding interview preparation. This frontend provides real-time visualization of code execution with advanced animations, data structure visualizations, and comprehensive interview preparation features.

## 🚀 Key Features

### 1. **Enhanced Visualization**
- **Real-time Code Execution**: Step through code line by line with visual highlighting
- **Animated Data Structures**: Beautiful visualizations for arrays, linked lists, trees, and more
- **Variable Tracking**: Watch variables change with smooth animations and highlighting
- **Call Stack Visualization**: See function calls push and pop with animations
- **Current Line Focus**: Prominent display of the executing line with sweep animation

### 2. **Interview Preparation Tools**
- **Algorithm Templates**: Pre-loaded templates for common data structures and algorithms
- **Pattern Library**: Implementation examples for two pointers, sliding window, DFS/BFS, etc.
- **Problem Bank**: Curated list of popular interview problems by category
- **Complexity Analyzer**: Automatic time and space complexity analysis with visual charts

### 3. **Modern UI/UX**
- **Dark Theme**: Easy on the eyes during long coding sessions
- **Responsive Design**: Works on desktop and tablet devices
- **Smooth Animations**: Carefully crafted animations that aid understanding
- **Intuitive Controls**: Play, pause, step forward/backward with speed control

## 📁 Project Structure

```
frontend/
├── index.html          # Main HTML file with enhanced layout
├── styles.css          # Comprehensive styling with animations
├── app.js             # Core application logic
├── visualizer.js      # Data structure visualization engine
├── interview-prep.js  # Interview preparation features
└── README.md          # This file
```

## 🎨 Visual Enhancements

### Animations
- **Variable Changes**: Pulsing animation when values change
- **New Variables**: Slide-in animation for newly created variables
- **Call Stack**: Push/pop animations for function calls
- **Current Line**: Sweeping highlight effect
- **Data Structures**: Fade-in animations for array/list elements

### Color Scheme
- Primary: `#6366f1` (Indigo)
- Secondary: `#8b5cf6` (Purple)
- Accent: `#ec4899` (Pink)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Amber)
- Error: `#ef4444` (Red)

## 🛠️ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Configure Backend URL**
   Edit `app.js` and update the `API_URL`:
   ```javascript
   const API_URL = 'https://your-backend-url.com';
   ```

3. **Serve the Frontend**
   You can use any static file server:
   ```bash
   # Using Python
   python -m http.server 8080

   # Using Node.js
   npx serve .

   # Using VS Code Live Server
   # Right-click on index.html → "Open with Live Server"
   ```

4. **Open in Browser**
   Navigate to `http://localhost:8080`

## 🎯 Interview Preparation Features

### Code Templates
- **Arrays**: Two-pointer technique example
- **Linked Lists**: Implementation with reversal
- **Trees**: Binary tree traversals
- **Graphs**: DFS and BFS implementations
- **Dynamic Programming**: Memoization examples
- **Sorting**: Quick sort implementation

### Algorithm Patterns
- **Two Pointers**: For sorted arrays/strings
- **Sliding Window**: For subarray problems
- **Fast & Slow Pointers**: For cycle detection
- **Tree Traversal**: DFS and BFS patterns
- **Binary Search**: For sorted data
- **Backtracking**: For permutations/combinations

### Complexity Analysis
The tool automatically analyzes your code for:
- Loop detection and nesting levels
- Recursive calls
- Data structure usage
- Space allocation patterns

## 🎮 Usage Guide

### Basic Usage
1. Write or select code from templates
2. Click "Run" to execute
3. Use playback controls to step through execution
4. Watch variables and data structures update in real-time

### Keyboard Shortcuts
- `Ctrl/Cmd + Enter`: Run code
- `Space`: Play/Pause execution
- `←`: Step backward
- `→`: Step forward
- `R`: Restart execution

### Tips for Interview Prep
1. Start with algorithm patterns to understand common techniques
2. Practice with the problem bank organized by difficulty
3. Pay attention to the complexity analysis
4. Use the visualization to debug your understanding
5. Try modifying templates to solve variations

## 🔧 Customization

### Adding New Templates
Edit `interview-prep.js` and add to the `codeTemplates` object:
```javascript
codeTemplates.myTemplate = `# Your template code here`;
```

### Adding New Patterns
Add to the `algorithmPatterns` object in `interview-prep.js`:
```javascript
algorithmPatterns['my-pattern'] = `# Pattern implementation`;
```

### Styling Modifications
All styles are in `styles.css` with CSS variables for easy theming:
```css
:root {
    --primary-color: #6366f1;
    /* Modify colors here */
}
```

## 🚀 Deployment

### Static Hosting Options
1. **GitHub Pages**
   - Push to GitHub repository
   - Enable GitHub Pages in settings

2. **Netlify**
   - Drag and drop the frontend folder
   - Instant deployment

3. **Vercel**
   - Connect GitHub repository
   - Auto-deploy on push

4. **AWS S3**
   - Create S3 bucket with static hosting
   - Upload all files

### Environment Configuration
Remember to update the `API_URL` in `app.js` to point to your deployed backend.

## 📈 Future Enhancements

- [ ] Support for more programming languages
- [ ] Collaborative coding sessions
- [ ] Save and share visualizations
- [ ] Integration with LeetCode/HackerRank
- [ ] AI-powered hints and explanations
- [ ] Mobile responsive design
- [ ] Offline mode with service workers

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📄 License

This project is open source and available under the MIT License.