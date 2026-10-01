"""Vercel Serverless & Local HTTP Server Dual Support"""
import json, re, sqlite3, pathlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

BASE = pathlib.Path(__file__).parent

def get_queries():
    q_file = BASE / "queries.sql"
    if not q_file.exists() and (BASE / "db/queries.sql").exists():
        q_file = BASE / "db/queries.sql"
    return dict(re.findall(r"-- name: (\w+)\n(.*?)(?=\n-- name:|\Z)",
                           q_file.read_text(encoding="utf-8"), re.S))

def run(name):
    queries = get_queries()
    if name not in queries:
        return None
    db_path = BASE / "noshow.db"
    if not db_path.exists() and (BASE / "db/noshow.db").exists():
        db_path = BASE / "db/noshow.db"
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    rows = [dict(r) for r in con.execute(queries[name])]
    con.close()
    return rows[0] if name == "summary" else rows

# Vercel Serverless WSGI Handler
def app(environ, start_response):
    path = urlparse(environ.get('PATH_INFO', '')).path
    if path.startswith('/api/'):
        name = path[5:]
        data = run(name)
        if data is None:
            start_response('404 Not Found', [('Content-Type', 'text/plain')])
            return [b'unknown endpoint']
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        start_response('200 OK', [
            ('Content-Type', 'application/json; charset=utf-8'),
            ('Content-Length', str(len(body)))
        ])
        return [body]
    else:
        start_response('404 Not Found', [('Content-Type', 'text/plain')])
        return [b'Not Found']

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=str(BASE / "static"), **k)
    def do_GET(self):
        path = urlparse(self.path).path
        if path.startswith("/api/"):
            name = path[5:]
            data = run(name)
            if data is None:
                self.send_error(404, "unknown endpoint"); return
            body = json.dumps(data, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body))); self.end_headers()
            self.wfile.write(body)
        else:
            super().do_GET()

if __name__ == "__main__":
    print("http://localhost:8000")
    ThreadingHTTPServer(("", 8000), Handler).serve_forever()
