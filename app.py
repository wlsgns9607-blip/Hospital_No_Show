"""표준 라이브러리만 사용하는 API 서버.  실행: python app.py  ->  http://localhost:8000"""
import json, re, sqlite3, pathlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

BASE = pathlib.Path(__file__).parent
QUERIES = dict(re.findall(r"-- name: (\w+)\n(.*?)(?=\n-- name:|\Z)",
                          (BASE / "db/queries.sql").read_text(encoding="utf-8"), re.S))

def run(name):
    con = sqlite3.connect(BASE / "noshow.db"); con.row_factory = sqlite3.Row
    rows = [dict(r) for r in con.execute(QUERIES[name])]; con.close()
    return rows[0] if name == "summary" else rows

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=str(BASE / "static"), **k)
    def do_GET(self):
        path = urlparse(self.path).path
        if path.startswith("/api/"):
            name = path[5:]
            if name not in QUERIES:
                self.send_error(404, "unknown endpoint"); return
            body = json.dumps(run(name), ensure_ascii=False).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body))); self.end_headers()
            self.wfile.write(body)
        else:
            super().do_GET()

if __name__ == "__main__":
    print("http://localhost:8000"); ThreadingHTTPServer(("", 8000), Handler).serve_forever()

