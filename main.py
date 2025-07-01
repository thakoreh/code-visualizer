from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import sys
import io
import traceback
import json
import os
import time
import ast
import re
from collections import defaultdict, Counter
from typing import Dict, List, Any, Optional

app = FastAPI()

# Enable CORS for all origins (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str
    analyze_complexity: Optional[bool] = True
    track_performance: Optional[bool] = True

MAX_TRACE_STEPS = 500

# Denylist for variables to hide from user
VARS_DENYLIST = {'self', '__builtins__', '__doc__', '__name__', '__package__', '__loader__', '__spec__', '__annotations__', '__cached__', '__file__', '__builtins__', '__warningregistry__'}

# Helper to get a preview of an object
def safe_repr(val):
    try:
        r = repr(val)
        if len(r) > 200:
            return r[:200] + '... [truncated]'
        return r
    except Exception:
        return '<unrepresentable>'

def is_heap_obj(val):
    # Only allow list, dict, set (not function, module, etc.)
    return type(val) in (list, dict, set)

def get_heap_and_locals(locals_dict):
    heap = {}
    locals_out = {}
    for k, v in locals_dict.items():
        # Only show user variables: not starting with _ and not in denylist
        if k.startswith('_') or k in VARS_DENYLIST:
            continue
        if is_heap_obj(v):
            obj_id = str(id(v))
            heap[obj_id] = {
                'type': type(v).__name__,
                'preview': safe_repr(v),
                'size': len(v) if hasattr(v, '__len__') else 0
            }
            locals_out[str(k)] = {'type': type(v).__name__, 'id': obj_id}
        elif type(v) in (int, float, str, bool):
            locals_out[str(k)] = {'type': type(v).__name__, 'value': safe_repr(v)}
        # skip functions, modules, etc.
    return heap, locals_out

def get_user_call_stack(frame):
    stack = []
    heap = {}
    user_heap_ids = set()
    while frame:
        # Only include frames from user code
        if frame.f_code.co_filename == '<string>':
            frame_heap, frame_locals = get_heap_and_locals(frame.f_locals)
            heap.update(frame_heap)
            # Track heap object ids referenced by user variables
            for v in frame_locals.values():
                if 'id' in v:
                    user_heap_ids.add(v['id'])
            stack.append({
                'function': str(frame.f_code.co_name),
                'locals': frame_locals,
                'line_number': frame.f_lineno
            })
        frame = frame.f_back
    stack.reverse()  # so that the outermost frame is first
    # Only keep heap objects referenced by user variables
    heap = {hid: heap[hid] for hid in user_heap_ids if hid in heap}
    return stack, heap

def analyze_code_complexity(code: str) -> Dict[str, Any]:
    """Analyze code complexity for interview preparation insights."""
    try:
        tree = ast.parse(code)
        complexity_info = {
            'cyclomatic_complexity': 1,  # Base complexity
            'nesting_depth': 0,
            'function_count': 0,
            'loop_count': 0,
            'conditional_count': 0,
            'recursive_calls': 0,
            'data_structures_used': set(),
            'algorithms_detected': [],
            'time_complexity_hints': [],
            'space_complexity_hints': []
        }
        
        max_depth = 0
        current_depth = 0
        function_names = set()
        
        class ComplexityVisitor(ast.NodeVisitor):
            def __init__(self):
                self.depth = 0
                self.max_depth = 0
                
            def visit_FunctionDef(self, node):
                complexity_info['function_count'] += 1
                function_names.add(node.name)
                self.depth += 1
                self.max_depth = max(self.max_depth, self.depth)
                self.generic_visit(node)
                self.depth -= 1
                
            def visit_For(self, node):
                complexity_info['loop_count'] += 1
                complexity_info['cyclomatic_complexity'] += 1
                self.depth += 1
                self.max_depth = max(self.max_depth, self.depth)
                
                # Detect nested loops for complexity analysis
                if self.depth > 1:
                    complexity_info['time_complexity_hints'].append(f"Nested loop detected at depth {self.depth}")
                
                self.generic_visit(node)
                self.depth -= 1
                
            def visit_While(self, node):
                complexity_info['loop_count'] += 1
                complexity_info['cyclomatic_complexity'] += 1
                self.depth += 1
                self.max_depth = max(self.max_depth, self.depth)
                self.generic_visit(node)
                self.depth -= 1
                
            def visit_If(self, node):
                complexity_info['conditional_count'] += 1
                complexity_info['cyclomatic_complexity'] += 1
                self.depth += 1
                self.max_depth = max(self.max_depth, self.depth)
                self.generic_visit(node)
                self.depth -= 1
                
            def visit_Call(self, node):
                if isinstance(node.func, ast.Name) and node.func.id in function_names:
                    complexity_info['recursive_calls'] += 1
                    
                # Detect built-in data structure operations
                if isinstance(node.func, ast.Attribute):
                    if node.func.attr in ['append', 'extend', 'insert', 'remove', 'pop']:
                        complexity_info['data_structures_used'].add('list')
                    elif node.func.attr in ['add', 'remove', 'discard', 'update']:
                        complexity_info['data_structures_used'].add('set')
                    elif node.func.attr in ['get', 'pop', 'update', 'keys', 'values', 'items']:
                        complexity_info['data_structures_used'].add('dict')
                        
                self.generic_visit(node)
                
            def visit_List(self, node):
                complexity_info['data_structures_used'].add('list')
                self.generic_visit(node)
                
            def visit_Dict(self, node):
                complexity_info['data_structures_used'].add('dict')
                self.generic_visit(node)
                
            def visit_Set(self, node):
                complexity_info['data_structures_used'].add('set')
                self.generic_visit(node)
        
        visitor = ComplexityVisitor()
        visitor.visit(tree)
        complexity_info['nesting_depth'] = visitor.max_depth
        complexity_info['data_structures_used'] = list(complexity_info['data_structures_used'])
        
        # Algorithm pattern detection
        code_lower = code.lower()
        if 'sort' in code_lower or 'sorted' in code_lower:
            complexity_info['algorithms_detected'].append('Sorting')
            complexity_info['time_complexity_hints'].append('Sorting typically O(n log n)')
            
        if complexity_info['recursive_calls'] > 0:
            complexity_info['algorithms_detected'].append('Recursion')
            complexity_info['space_complexity_hints'].append('Recursion uses O(depth) stack space')
            
        if complexity_info['loop_count'] >= 2:
            complexity_info['algorithms_detected'].append('Nested Iteration')
            
        return complexity_info
        
    except Exception as e:
        return {'error': f'Failed to analyze complexity: {str(e)}'}

def get_performance_metrics(trace_data: List[Dict]) -> Dict[str, Any]:
    """Generate performance insights for interview preparation."""
    if not trace_data:
        return {}
        
    metrics = {
        'total_steps': len(trace_data),
        'memory_usage_pattern': [],
        'variable_lifecycle': defaultdict(list),
        'hotspots': [],
        'efficiency_tips': []
    }
    
    # Track memory usage over time
    for i, step in enumerate(trace_data):
        heap_size = len(step.get('heap', {}))
        locals_count = len(step.get('locals', {}))
        metrics['memory_usage_pattern'].append({
            'step': i,
            'heap_objects': heap_size,
            'local_variables': locals_count
        })
        
        # Track variable lifecycle
        for var_name in step.get('locals', {}):
            metrics['variable_lifecycle'][var_name].append(i)
    
    # Identify performance hotspots (lines executed many times)
    line_counts = Counter(step.get('line', 0) for step in trace_data)
    hotspots = [(line, count) for line, count in line_counts.most_common(5) if count > 1]
    metrics['hotspots'] = [{'line': line, 'executions': count} for line, count in hotspots]
    
    # Generate efficiency tips
    if len(metrics['memory_usage_pattern']) > 10:
        max_heap = max(step['heap_objects'] for step in metrics['memory_usage_pattern'])
        if max_heap > 5:
            metrics['efficiency_tips'].append('Consider memory optimization - many heap objects created')
    
    if hotspots:
        metrics['efficiency_tips'].append(f'Line {hotspots[0][0]} executed {hotspots[0][1]} times - potential optimization target')
    
    return metrics

@app.post("/run")
def run_code(req: CodeRequest):
    start_time = time.time()
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    sys.stdout = io.StringIO()
    sys.stderr = io.StringIO()
    trace = []
    results = []
    step_idx = 0
    execution_times = []
    
    def trace_calls(frame, event, arg):
        nonlocal step_idx
        step_start_time = time.time()
        
        if event == 'line' and len(trace) < MAX_TRACE_STEPS:
            lineno = frame.f_lineno
            # Only use user code frames for call stack and heap
            call_stack, heap = get_user_call_stack(frame)
            # Use the top frame's locals for the locals panel
            locals_out = call_stack[-1]['locals'] if call_stack else {}
            
            # Get the actual line of code being executed
            code_lines = req.code.split('\n')
            current_line = code_lines[lineno - 1] if lineno <= len(code_lines) else ""
            
            trace.append({
                'line': lineno,
                'code': current_line.strip(),
                'locals': locals_out,
                'call_stack': call_stack,
                'heap': heap,
                'timestamp': time.time() - start_time,
                'step_index': step_idx
            })
            step_idx += 1
            
        # Detect return events in user code
        if event == 'return' and frame.f_code.co_filename == '<string>':
            # Record the return value and step index
            results.append({
                'step': step_idx - 1 if step_idx > 0 else 0,
                'value': safe_repr(arg),
                'timestamp': time.time() - start_time
            })
            
        execution_times.append(time.time() - step_start_time)
        return trace_calls
    
    try:
        sys.settrace(trace_calls)
        exec(req.code, {})
    except Exception:
        error = traceback.format_exc()
    else:
        error = sys.stderr.getvalue()
    finally:
        sys.settrace(None)
        out = sys.stdout.getvalue()
        err = error if error else sys.stderr.getvalue()
        sys.stdout = old_stdout
        sys.stderr = old_stderr
    
    total_time = time.time() - start_time
    
    # Generate analysis data
    complexity_analysis = analyze_code_complexity(req.code) if req.analyze_complexity else {}
    performance_metrics = get_performance_metrics(trace) if req.track_performance else {}
    
    # Add interview preparation insights
    interview_insights = {
        'code_quality_score': min(100, max(0, 100 - complexity_analysis.get('cyclomatic_complexity', 1) * 5)),
        'readability_tips': [],
        'optimization_suggestions': [],
        'common_patterns': []
    }
    
    if complexity_analysis.get('nesting_depth', 0) > 3:
        interview_insights['readability_tips'].append('Consider reducing nesting depth for better readability')
    
    if complexity_analysis.get('cyclomatic_complexity', 1) > 10:
        interview_insights['optimization_suggestions'].append('High complexity - consider breaking into smaller functions')
    
    if 'list' in complexity_analysis.get('data_structures_used', []):
        interview_insights['common_patterns'].append('Array/List manipulation')
    
    return {
        "stdout": out,
        "stderr": err,
        "trace": trace,
        "results": results,
        "trace_truncated": len(trace) >= MAX_TRACE_STEPS,
        "execution_time": total_time,
        "complexity_analysis": complexity_analysis,
        "performance_metrics": performance_metrics,
        "interview_insights": interview_insights,
        "code_lines": req.code.split('\n')
    }

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
def serve_frontend():
    """Serve the main frontend application."""
    try:
        with open("static/index.html", "r") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return HTMLResponse(content="""
        <html>
            <head><title>Code Visualizer</title></head>
            <body>
                <h1>Code Visualizer Backend API</h1>
                <p>Frontend not found. Please ensure static files are properly deployed.</p>
                <p>API is running at <code>/run</code></p>
            </body>
        </html>
        """)

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 