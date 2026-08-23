# Gunicorn configuration for Flask + Flask-SocketIO + nginx
#
# Recommended deployment scheme:
#   nginx -> 127.0.0.1:5000 -> gunicorn -> Flask-SocketIO
#
# IMPORTANT:
# For Flask-SocketIO with the gevent-websocket Gunicorn worker,
# keep workers = 1 unless a multi-worker Socket.IO architecture
# with a message queue (Redis, etc.) is configured.

# ---------------------------------------------------------------------------
# Network
# ---------------------------------------------------------------------------

# Gunicorn is intended to be accessed through nginx on the same server.
# Do not expose port 5000 directly to the Internet.
bind = "127.0.0.1:5000"

# ---------------------------------------------------------------------------
# Socket.IO / WebSocket worker
# ---------------------------------------------------------------------------

workers = 1
worker_class = "geventwebsocket.gunicorn.workers.GeventWebSocketWorker"

# Maximum simultaneous clients handled by the gevent worker.
worker_connections = 1000

# ---------------------------------------------------------------------------
# Timeouts
# ---------------------------------------------------------------------------

# Timeout for a worker that stops responding.
# WebSocket traffic handled by the gevent worker is not treated like a
# normal long HTTP request, so persistent Socket.IO connections can remain open.
timeout = 120

# Time allowed for graceful worker shutdown.
graceful_timeout = 30

# HTTP keep-alive between nginx and Gunicorn.
keepalive = 5

# ---------------------------------------------------------------------------
# Process behaviour
# ---------------------------------------------------------------------------

# Do not preload the Flask application before the worker is forked.
# This is safer for Socket.IO/gevent initialization and app resources.
preload_app = False

# Do not recycle workers by request count. A forced recycle can disconnect
# active Socket.IO/WebSocket clients.
max_requests = 0

# Name shown in process listings.
proc_name = "game"

# ---------------------------------------------------------------------------
# Proxy / forwarded headers
# ---------------------------------------------------------------------------

# Trust X-Forwarded-* headers only from the local nginx proxy.
forwarded_allow_ips = "127.0.0.1"

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"

loglevel = "info"
capture_output = True

# Gunicorn access log format.
access_log_format = (
    '%({x-forwarded-for}i)s %(l)s %(u)s %(t)s "%(r)s" '
    '%(s)s %(b)s "%(f)s" "%(a)s" %(L)s'
)

# ---------------------------------------------------------------------------
# Misc
# ---------------------------------------------------------------------------

# Prevent excessively large HTTP request headers.
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

# Temporary worker files should live in RAM on Linux where available.
# This avoids occasional stalls caused by disk-backed heartbeat files.
worker_tmp_dir = "/dev/shm"