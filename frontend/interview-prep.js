// Interview Preparation Features

// Code Templates
const codeTemplates = {
    array: `# Two Pointer Technique - Find pair with target sum
def two_sum(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left < right:
        current_sum = arr[left] + arr[right]
        
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    
    return []

# Test the function
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
target = 10
result = two_sum(numbers, target)
print(f"Indices: {result}")
if result:
    print(f"Values: {numbers[result[0]]}, {numbers[result[1]]}")`,

    linkedlist: `# Linked List Implementation
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node
    
    def reverse(self):
        prev = None
        current = self.head
        
        while current:
            next_node = current.next
            current.next = prev
            prev = current
            current = next_node
        
        self.head = prev
    
    def display(self):
        elements = []
        current = self.head
        while current:
            elements.append(current.data)
            current = current.next
        return elements

# Test the implementation
ll = LinkedList()
for i in [1, 2, 3, 4, 5]:
    ll.append(i)

print("Original:", ll.display())
ll.reverse()
print("Reversed:", ll.display())`,

    tree: `# Binary Tree Traversal
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def inorder_traversal(root):
    result = []
    
    def inorder(node):
        if not node:
            return
        
        inorder(node.left)
        result.append(node.val)
        inorder(node.right)
    
    inorder(root)
    return result

def level_order_traversal(root):
    if not root:
        return []
    
    result = []
    queue = [root]
    
    while queue:
        level_size = len(queue)
        current_level = []
        
        for _ in range(level_size):
            node = queue.pop(0)
            current_level.append(node.val)
            
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        
        result.append(current_level)
    
    return result

# Create a sample tree
#       1
#      / \\
#     2   3
#    / \\
#   4   5
root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)
root.left.left = TreeNode(4)
root.left.right = TreeNode(5)

print("Inorder:", inorder_traversal(root))
print("Level order:", level_order_traversal(root))`,

    graph: `# Graph Traversal - DFS and BFS
from collections import deque

class Graph:
    def __init__(self):
        self.graph = {}
    
    def add_edge(self, u, v):
        if u not in self.graph:
            self.graph[u] = []
        self.graph[u].append(v)
    
    def dfs(self, start):
        visited = set()
        result = []
        
        def dfs_helper(node):
            visited.add(node)
            result.append(node)
            
            for neighbor in self.graph.get(node, []):
                if neighbor not in visited:
                    dfs_helper(neighbor)
        
        dfs_helper(start)
        return result
    
    def bfs(self, start):
        visited = set([start])
        queue = deque([start])
        result = []
        
        while queue:
            node = queue.popleft()
            result.append(node)
            
            for neighbor in self.graph.get(node, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        
        return result

# Create a sample graph
g = Graph()
edges = [(0, 1), (0, 2), (1, 2), (2, 0), (2, 3), (3, 3)]
for u, v in edges:
    g.add_edge(u, v)

print("DFS from vertex 2:", g.dfs(2))
print("BFS from vertex 2:", g.bfs(2))`,

    dp: `# Dynamic Programming - Fibonacci with memoization
def fibonacci_memo(n, memo={}):
    # Base cases
    if n <= 1:
        return n
    
    # Check if already computed
    if n in memo:
        return memo[n]
    
    # Compute and store
    memo[n] = fibonacci_memo(n-1, memo) + fibonacci_memo(n-2, memo)
    return memo[n]

# Dynamic Programming - Coin Change
def coin_change(coins, amount):
    # dp[i] = minimum coins needed for amount i
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    
    return dp[amount] if dp[amount] != float('inf') else -1

# Test the functions
print("Fibonacci sequence:")
for i in range(10):
    print(f"F({i}) = {fibonacci_memo(i)}")

print("\\nCoin change:")
coins = [1, 2, 5]
amount = 11
result = coin_change(coins, amount)
print(f"Minimum coins for {amount}: {result}")`,

    sorting: `# Quick Sort Implementation
def quicksort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    
    if low < high:
        # Partition the array
        pivot_index = partition(arr, low, high)
        
        # Recursively sort left and right parts
        quicksort(arr, low, pivot_index - 1)
        quicksort(arr, pivot_index + 1, high)
    
    return arr

def partition(arr, low, high):
    # Choose the rightmost element as pivot
    pivot = arr[high]
    
    # Index of smaller element
    i = low - 1
    
    for j in range(low, high):
        # If current element is smaller than or equal to pivot
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    # Place pivot in its correct position
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

# Test the implementation
numbers = [64, 34, 25, 12, 22, 11, 90]
print("Original array:", numbers)
sorted_numbers = quicksort(numbers.copy())
print("Sorted array:", sorted_numbers)`
};

// Algorithm Patterns
const algorithmPatterns = {
    'two-pointers': `# Two Pointers Pattern
# Used for: Array/String problems, often with sorted data

def remove_duplicates(arr):
    """Remove duplicates from sorted array in-place"""
    if not arr:
        return 0
    
    # Slow pointer for unique elements
    write_pos = 1
    
    # Fast pointer to scan array
    for read_pos in range(1, len(arr)):
        if arr[read_pos] != arr[read_pos - 1]:
            arr[write_pos] = arr[read_pos]
            write_pos += 1
    
    return write_pos

# Test
arr = [1, 1, 2, 2, 3, 4, 4, 5]
print("Original:", arr)
length = remove_duplicates(arr)
print(f"After removing duplicates: {arr[:length]}")`,

    'sliding-window': `# Sliding Window Pattern
# Used for: Subarray/Substring problems

def max_sum_subarray(arr, k):
    """Find maximum sum of subarray of size k"""
    if len(arr) < k:
        return None
    
    # Calculate sum of first window
    window_sum = sum(arr[:k])
    max_sum = window_sum
    
    # Slide the window
    for i in range(k, len(arr)):
        # Remove leftmost element, add rightmost
        window_sum = window_sum - arr[i - k] + arr[i]
        max_sum = max(max_sum, window_sum)
    
    return max_sum

# Test
arr = [2, 1, 5, 1, 3, 2]
k = 3
result = max_sum_subarray(arr, k)
print(f"Maximum sum of subarray of size {k}: {result}")`,

    'fast-slow': `# Fast & Slow Pointers (Floyd's Algorithm)
# Used for: Cycle detection, finding middle element

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def has_cycle(head):
    """Detect if linked list has a cycle"""
    if not head or not head.next:
        return False
    
    slow = head
    fast = head.next
    
    while fast and fast.next:
        if slow == fast:
            return True
        slow = slow.next
        fast = fast.next.next
    
    return False

def find_middle(head):
    """Find middle of linked list"""
    if not head:
        return None
    
    slow = fast = head
    
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    
    return slow

# Test cycle detection
# Create a list with cycle: 1 -> 2 -> 3 -> 4 -> 2
node1 = ListNode(1)
node2 = ListNode(2)
node3 = ListNode(3)
node4 = ListNode(4)
node1.next = node2
node2.next = node3
node3.next = node4
node4.next = node2  # Creates cycle

print("Has cycle:", has_cycle(node1))`,

    'tree-traversal': `# Tree Traversal Patterns
# DFS (Preorder, Inorder, Postorder) and BFS

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# DFS Patterns
def preorder(root):
    """Root -> Left -> Right"""
    if not root:
        return []
    return [root.val] + preorder(root.left) + preorder(root.right)

def inorder(root):
    """Left -> Root -> Right"""
    if not root:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)

def postorder(root):
    """Left -> Right -> Root"""
    if not root:
        return []
    return postorder(root.left) + postorder(root.right) + [root.val]

# BFS Pattern
def level_order(root):
    """Level by level traversal"""
    if not root:
        return []
    
    result = []
    queue = [root]
    
    while queue:
        level_size = len(queue)
        current_level = []
        
        for _ in range(level_size):
            node = queue.pop(0)
            current_level.append(node.val)
            
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        
        result.append(current_level)
    
    return result

# Create sample tree
root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)
root.left.left = TreeNode(4)
root.left.right = TreeNode(5)

print("Preorder:", preorder(root))
print("Inorder:", inorder(root))
print("Postorder:", postorder(root))
print("Level order:", level_order(root))`,

    'binary-search': `# Binary Search Pattern
# Used for: Searching in sorted arrays, finding boundaries

def binary_search(arr, target):
    """Classic binary search"""
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

def find_first_occurrence(arr, target):
    """Find first occurrence of target"""
    left, right = 0, len(arr) - 1
    result = -1
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if arr[mid] == target:
            result = mid
            right = mid - 1  # Continue searching left
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return result

# Test
arr = [1, 2, 2, 2, 3, 4, 5]
target = 2
print(f"Binary search for {target}:", binary_search(arr, target))
print(f"First occurrence of {target}:", find_first_occurrence(arr, target))`,

    'backtracking': `# Backtracking Pattern
# Used for: Permutations, Combinations, Sudoku, N-Queens

def permutations(nums):
    """Generate all permutations"""
    result = []
    
    def backtrack(path, remaining):
        if not remaining:
            result.append(path[:])
            return
        
        for i in range(len(remaining)):
            # Choose
            path.append(remaining[i])
            # Explore
            backtrack(path, remaining[:i] + remaining[i+1:])
            # Unchoose
            path.pop()
    
    backtrack([], nums)
    return result

def combinations(n, k):
    """Generate all combinations of k numbers from 1 to n"""
    result = []
    
    def backtrack(start, path):
        if len(path) == k:
            result.append(path[:])
            return
        
        for i in range(start, n + 1):
            path.append(i)
            backtrack(i + 1, path)
            path.pop()
    
    backtrack(1, [])
    return result

# Test
print("Permutations of [1,2,3]:", permutations([1, 2, 3]))
print("Combinations C(4,2):", combinations(4, 2))`
};

// Load template
function loadTemplate(event) {
    const template = event.target.value;
    if (template && codeTemplates[template]) {
        editor.setValue(codeTemplates[template]);
        event.target.value = '';
    }
}

// Load pattern
function loadPattern(pattern) {
    if (algorithmPatterns[pattern]) {
        editor.setValue(algorithmPatterns[pattern]);
        switchTab('visualizer');
    }
}

// Interview Problems
const interviewProblems = {
    arrays: [
        { name: "Two Sum", difficulty: "easy", description: "Find two numbers that add up to target" },
        { name: "Best Time to Buy and Sell Stock", difficulty: "easy", description: "Find maximum profit" },
        { name: "Contains Duplicate", difficulty: "easy", description: "Check if array has duplicates" },
        { name: "Product of Array Except Self", difficulty: "medium", description: "Calculate products" },
        { name: "Maximum Subarray", difficulty: "medium", description: "Find contiguous subarray with max sum" },
        { name: "3Sum", difficulty: "medium", description: "Find triplets that sum to zero" },
        { name: "Container With Most Water", difficulty: "medium", description: "Find max area" },
        { name: "Trapping Rain Water", difficulty: "hard", description: "Calculate trapped water" }
    ],
    linkedlists: [
        { name: "Reverse Linked List", difficulty: "easy", description: "Reverse a singly linked list" },
        { name: "Merge Two Sorted Lists", difficulty: "easy", description: "Merge two sorted lists" },
        { name: "Linked List Cycle", difficulty: "easy", description: "Detect cycle in linked list" },
        { name: "Remove Nth Node From End", difficulty: "medium", description: "Remove nth node from end" },
        { name: "Add Two Numbers", difficulty: "medium", description: "Add numbers represented as lists" },
        { name: "Copy List with Random Pointer", difficulty: "medium", description: "Deep copy special list" },
        { name: "LRU Cache", difficulty: "medium", description: "Implement LRU cache" },
        { name: "Merge k Sorted Lists", difficulty: "hard", description: "Merge k sorted linked lists" }
    ],
    trees: [
        { name: "Maximum Depth of Binary Tree", difficulty: "easy", description: "Find maximum depth" },
        { name: "Invert Binary Tree", difficulty: "easy", description: "Mirror a binary tree" },
        { name: "Same Tree", difficulty: "easy", description: "Check if two trees are identical" },
        { name: "Binary Tree Level Order Traversal", difficulty: "medium", description: "Level order traversal" },
        { name: "Validate Binary Search Tree", difficulty: "medium", description: "Check if valid BST" },
        { name: "Lowest Common Ancestor", difficulty: "medium", description: "Find LCA of two nodes" },
        { name: "Construct Binary Tree", difficulty: "medium", description: "Build tree from traversals" },
        { name: "Serialize and Deserialize Binary Tree", difficulty: "hard", description: "Encode/decode tree" }
    ],
    dp: [
        { name: "Climbing Stairs", difficulty: "easy", description: "Count ways to climb stairs" },
        { name: "House Robber", difficulty: "medium", description: "Maximum money without alerting" },
        { name: "Coin Change", difficulty: "medium", description: "Minimum coins for amount" },
        { name: "Longest Increasing Subsequence", difficulty: "medium", description: "Find LIS length" },
        { name: "Word Break", difficulty: "medium", description: "Check if string can be segmented" },
        { name: "Unique Paths", difficulty: "medium", description: "Count paths in grid" },
        { name: "Edit Distance", difficulty: "hard", description: "Minimum edits to convert strings" },
        { name: "Regular Expression Matching", difficulty: "hard", description: "Implement regex matching" }
    ]
};

// Load problems for category
function loadProblems(category) {
    const problemList = document.getElementById('problem-list');
    problemList.innerHTML = '';

    if (interviewProblems[category]) {
        interviewProblems[category].forEach(problem => {
            const item = document.createElement('div');
            item.className = 'problem-item';
            
            const info = document.createElement('div');
            info.innerHTML = `
                <strong>${problem.name}</strong>
                <p style="margin: 0; font-size: 0.875rem; color: var(--text-secondary)">
                    ${problem.description}
                </p>
            `;

            const difficulty = document.createElement('span');
            difficulty.className = `problem-difficulty difficulty-${problem.difficulty}`;
            difficulty.textContent = problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1);

            item.appendChild(info);
            item.appendChild(difficulty);
            item.addEventListener('click', () => loadProblemTemplate(problem.name));
            
            problemList.appendChild(item);
        });
    }
}

// Load problem template (placeholder - would load actual problem code)
function loadProblemTemplate(problemName) {
    // In a real implementation, this would load the specific problem template
    alert(`Loading template for: ${problemName}`);
    switchTab('visualizer');
}

// Complexity Analysis
function analyzeComplexity(code) {
    // Simple heuristic-based analysis
    const lines = code.split('\n');
    let timeComplexity = 'O(1)';
    let spaceComplexity = 'O(1)';
    let details = [];

    // Check for loops
    const loopCount = (code.match(/for|while/g) || []).length;
    const nestedLoopCount = countNestedLoops(lines);
    const recursionCount = (code.match(/def.*\(.*\):|function.*\(.*\)/g) || []).length;

    // Time complexity analysis
    if (nestedLoopCount >= 3) {
        timeComplexity = 'O(n³)';
        details.push('Triple nested loops detected');
    } else if (nestedLoopCount === 2) {
        timeComplexity = 'O(n²)';
        details.push('Nested loops detected');
    } else if (loopCount > 0) {
        if (code.includes('binary') || code.includes('bisect') || code.includes('//= 2')) {
            timeComplexity = 'O(log n)';
            details.push('Binary search pattern detected');
        } else {
            timeComplexity = 'O(n)';
            details.push('Linear iteration detected');
        }
    }

    // Space complexity analysis
    if (code.includes('[]') || code.includes('{}') || code.includes('set()')) {
        if (code.includes('dp') || code.includes('memo')) {
            spaceComplexity = 'O(n)';
            details.push('Dynamic programming array/memoization detected');
        } else if (nestedLoopCount >= 2) {
            spaceComplexity = 'O(n²)';
            details.push('2D array/matrix detected');
        } else {
            spaceComplexity = 'O(n)';
            details.push('Array/list/set storage detected');
        }
    }

    if (recursionCount > 0 && !code.includes('memo')) {
        spaceComplexity = 'O(n)';
        details.push('Recursive call stack detected');
    }

    // Update UI
    document.querySelector('#time-complexity .complexity-value').textContent = timeComplexity;
    document.querySelector('#space-complexity .complexity-value').textContent = spaceComplexity;
    document.getElementById('complexity-details').innerHTML = details.map(d => `<p>• ${d}</p>`).join('');

    // Draw complexity charts
    drawComplexityChart('time-complexity-chart', timeComplexity);
    drawComplexityChart('space-complexity-chart', spaceComplexity);
}

// Count nested loops
function countNestedLoops(lines) {
    let maxNesting = 0;
    let currentNesting = 0;

    lines.forEach(line => {
        if (line.includes('for') || line.includes('while')) {
            currentNesting++;
            maxNesting = Math.max(maxNesting, currentNesting);
        } else if (line.trim() && !line.startsWith(' ') && !line.startsWith('\t')) {
            currentNesting = 0;
        }
    });

    return maxNesting;
}

// Draw complexity chart
function drawComplexityChart(canvasId, complexity) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up chart
    const padding = 20;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;
    
    // Draw axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height + padding);
    ctx.lineTo(width + padding, height + padding);
    ctx.stroke();
    
    // Draw complexity curve
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const n = 100;
    for (let i = 0; i <= n; i++) {
        const x = padding + (i / n) * width;
        let y;
        
        switch (complexity) {
            case 'O(1)':
                y = height + padding - height * 0.2;
                break;
            case 'O(log n)':
                y = height + padding - height * (Math.log(i + 1) / Math.log(n));
                break;
            case 'O(n)':
                y = height + padding - height * (i / n);
                break;
            case 'O(n²)':
                y = height + padding - height * Math.pow(i / n, 2);
                break;
            case 'O(n³)':
                y = height + padding - height * Math.pow(i / n, 3);
                break;
            default:
                y = height + padding - height * (i / n);
        }
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px Arial';
    ctx.fillText('n', width + padding - 10, height + padding - 5);
    ctx.fillText('Time/Space', padding + 5, padding + 10);
}

// Export functions for use in main app
window.loadTemplate = loadTemplate;
window.loadPattern = loadPattern;
window.loadProblems = loadProblems;
window.analyzeComplexity = analyzeComplexity;