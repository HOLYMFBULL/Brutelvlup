# -*- coding: utf-8 -*-
"""
Database helper module for SAITO Level Up Bot.
Provides resilient SQLite database loading for bot.db with safe fallback.
"""

import os
import sqlite3
import json
from typing import List, Dict, Any

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bot.db")

def all_accounts_flat() -> List[Dict[str, Any]]:
    """
    Reads all accounts from bot.db if present.
    Returns empty list if bot.db does not exist yet.
    """
    if not os.path.exists(DB_PATH):
        return []

    results: List[Dict[str, Any]] = []
    try:
        conn = sqlite3.connect(DB_PATH, timeout=5)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        # Check if accounts table exists
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='accounts'")
        if not cur.fetchone():
            conn.close()
            return []

        cur.execute("SELECT * FROM accounts")
        rows = cur.fetchall()
        for r in rows:
            d = dict(r)
            auth_val = d.get("auth")
            if isinstance(auth_val, str):
                try:
                    d["auth"] = json.loads(auth_val)
                except Exception:
                    d["auth"] = {}
            elif not isinstance(auth_val, dict):
                d["auth"] = {}
            results.append(d)
        conn.close()
    except Exception:
        pass

    return results
