#!/bin/sh
set -e
export PYTHONPATH="${PYTHONPATH}:/app/backend:."
exec python -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}" --workers 1
