"""
Minimal user auth for Arogya Gwalior.
Name + (phone OR email) -> token. Users and sessions are stored in a small SQLite file (data/users.db).
No OTP / password on purpose (kept simple).
"""
import os
import re
import secrets
import sqlite3
import threading
from datetime import datetime
from typing import Optional, Dict, Any

PHONE_RE = re.compile(r"^[6-9]\d{9}$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def normalize_phone(raw: Optional[str]) -> str:
    """Keep last 10 digits (drops +91 / 0 / spaces). Returns '' if empty."""
    digits = re.sub(r"\D", "", raw or "")
    return digits[-10:] if len(digits) >= 10 else digits


class AuthStore:
    def __init__(self, data_dir: str):
        self.path = os.path.join(data_dir, "users.db")
        self.lock = threading.Lock()
        self.conn = sqlite3.connect(self.path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT UNIQUE,
                email TEXT UNIQUE,
                created_at TEXT,
                last_login TEXT,
                login_count INTEGER DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id INTEGER,
                created_at TEXT
            );
        """)
        self.conn.commit()

    @staticmethod
    def _now() -> str:
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    @staticmethod
    def _public(row: sqlite3.Row) -> Dict[str, Any]:
        return {
            "id": row["id"],
            "name": row["name"],
            "phone": row["phone"] or "",
            "email": row["email"] or "",
            "created_at": row["created_at"],
            "last_login": row["last_login"],
            "login_count": row["login_count"],
        }

    def login(self, name: str, phone: Optional[str], email: Optional[str]) -> Dict[str, Any]:
        """Validate, find-or-create user, open session. Raises ValueError with a user-facing message."""
        name = (name or "").strip()
        phone = normalize_phone(phone)
        email = (email or "").strip().lower()

        if len(name) < 2:
            raise ValueError("Please enter your name.")
        if not phone and not email:
            raise ValueError("Please enter a phone number or an email.")
        if phone and not PHONE_RE.match(phone):
            raise ValueError("Enter a valid 10-digit mobile number.")
        if email and not EMAIL_RE.match(email):
            raise ValueError("Enter a valid email address.")

        with self.lock:
            cur = self.conn.cursor()
            row = None
            if phone:
                row = cur.execute("SELECT * FROM users WHERE phone=?", (phone,)).fetchone()
            if row is None and email:
                row = cur.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()

            now = self._now()
            if row is None:
                cur.execute(
                    "INSERT INTO users (name, phone, email, created_at, last_login, login_count) VALUES (?,?,?,?,?,1)",
                    (name, phone or None, email or None, now, now),
                )
                uid = cur.lastrowid
            else:
                uid = row["id"]
                # fill in a missing phone/email if the user now provided it (and it isn't taken)
                new_phone = row["phone"] or (phone or None)
                new_email = row["email"] or (email or None)
                try:
                    cur.execute(
                        "UPDATE users SET name=?, phone=?, email=?, last_login=?, login_count=login_count+1 WHERE id=?",
                        (name, new_phone, new_email, now, uid),
                    )
                except sqlite3.IntegrityError:
                    cur.execute(
                        "UPDATE users SET name=?, last_login=?, login_count=login_count+1 WHERE id=?",
                        (name, now, uid),
                    )

            token = secrets.token_urlsafe(32)
            cur.execute("INSERT INTO sessions (token, user_id, created_at) VALUES (?,?,?)", (token, uid, now))
            self.conn.commit()
            user = cur.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
            return {"token": token, "user": self._public(user)}

    def get_user(self, token: Optional[str]) -> Optional[Dict[str, Any]]:
        if not token:
            return None
        with self.lock:
            row = self.conn.execute(
                "SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token=?", (token,)
            ).fetchone()
        return self._public(row) if row else None

    def logout(self, token: Optional[str]) -> None:
        if not token:
            return
        with self.lock:
            self.conn.execute("DELETE FROM sessions WHERE token=?", (token,))
            self.conn.commit()
