from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import io
import traceback
import json
import os
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Enable CORS for all origins (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static directory so that the frontend (index.html, css, js) can be served directly.
app.mount("/static", StaticFiles(directory="static"), name="static")

class CodeRequest(BaseModel):
    code: str

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
                'preview': safe_repr(v)
            }
            # Store both reference id and a preview string so the frontend can show
            # variable chips without having to cross-reference the heap table.
            locals_out[str(k)] = {
                'type': type(v).__name__,
                'id': obj_id,
                'preview': safe_repr(v)
            }
        elif type(v) in (int, float, str, bool):
            val_repr = safe_repr(v)
            locals_out[str(k)] = {
                'type': type(v).__name__,
                'value': val_repr,
                'preview': val_repr
            }
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
                'locals': frame_locals
            })
        frame = frame.f_back
    stack.reverse()  # so that the outermost frame is first
    # Only keep heap objects referenced by user variables
    heap = {hid: heap[hid] for hid in user_heap_ids if hid in heap}
    return stack, heap

@app.post("/run")
def run_code(req: CodeRequest):
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    sys.stdout = io.StringIO()
    sys.stderr = io.StringIO()
    trace = []
    results = []
    step_idx = 0
    def trace_calls(frame, event, arg):
        nonlocal step_idx
        if event == 'line' and len(trace) < MAX_TRACE_STEPS:
            lineno = frame.f_lineno
            # Only use user code frames for call stack and heap
            call_stack, heap = get_user_call_stack(frame)
            # Use the top frame's locals for the locals panel
            locals_out = call_stack[-1]['locals'] if call_stack else {}
            trace.append({
                'line': lineno,
                'locals': locals_out,
                'call_stack': call_stack,
                'heap': heap
            })
            step_idx += 1
        # Detect return events in user code
        if event == 'return' and frame.f_code.co_filename == '<string>':
            # Record the return value and step index
            results.append({
                'step': step_idx - 1 if step_idx > 0 else 0,
                'value': safe_repr(arg)
            })
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
    return {
        "stdout": out,
        "stderr": err,
        "trace": trace,
        "results": results,
        "trace_truncated": len(trace) >= MAX_TRACE_STEPS
    }

# Add a simple health check endpoint
@app.get("/")
def health_check():
    return {"status": "healthy", "message": "Code Visualizer Backend API"}

@app.get("/health")
def health():
    return {"status": "ok"}

# ---------------------------------------------------------------------------
# UI ROUTES
# ---------------------------------------------------------------------------

# Serve the simple frontend UI for the code visualizer. This implements the
# pulsing‐glow highlight and smooth-scroll quick-wins.
@app.get("/ui", include_in_schema=False)
def serve_ui():
    return FileResponse("static/index.html")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 