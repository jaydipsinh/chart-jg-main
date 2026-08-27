"""
Angel One SmartAPI Service – Real-time institutional market data feed.
Provides live LTP, quotes, and candle data directly from Angel One API.
"""
import os
import time
import logging
import hmac
import hashlib
import struct
import base64
from typing import Dict, Any, Optional, List
import pandas as pd
import requests

logger = logging.getLogger(__name__)

# ── Pure Python TOTP Generator (RFC 6238) ──────────────────────────────────
def generate_totp(secret: str) -> str:
    """Generate 6-digit TOTP code from base32 secret in pure Python."""
    if not secret:
        return ""
    try:
        clean_secret = secret.upper().replace(" ", "")
        missing_padding = len(clean_secret) % 8
        if missing_padding:
            clean_secret += "=" * (8 - missing_padding)
        key = base64.b32decode(clean_secret, casefold=True)
        intervals_no = int(time.time()) // 30
        msg = struct.pack(">Q", intervals_no)
        h = hmac.new(key, msg, hashlib.sha1).digest()
        offset = h[-1] & 0x0F
        code = (struct.unpack(">I", h[offset:offset+4])[0] & 0x7FFFFFFF) % 1000000
        return f"{code:06d}"
    except Exception as e:
        logger.error("TOTP generation error: %s", e)
        return ""

# ── Symbol Token Mapping for NSE F&O Leaders ──────────────────────────────
SYMBOL_TOKEN_MAP: Dict[str, str] = {
    "TATASTEEL": "3499",
    "BEL": "383",
    "RELIANCE": "2885",
    "SBIN": "3045",
    "ICICIBANK": "4963",
    "INFY": "1594",
    "TCS": "11536",
    "HDFCBANK": "1333",
    "NTPC": "11630",
    "BANKBARODA": "4668",
    "INOXWIND": "17963",
    "TATAMOTORS": "3456",
    "BHARTIARTL": "10604",
    "LT": "11483",
    "HAL": "2303",
    "VEDL": "3071",
    "COALINDIA": "20374",
    "ONGC": "2475",
    "POWERGRID": "14977",
    "BPCL": "526",
    "IOC": "1624",
    "MARUTI": "10999",
    "SUNPHARMA": "3351",
    "TITAN": "3506",
    "WIPRO": "3787",
    "JSWSTEEL": "11723",
    "ADANIENT": "25",
    "ADANIPORTS": "15083",
    "CIPLA": "694",
    "DRREDDY": "881",
    "EICHERMOT": "910",
    "HEROMOTOCO": "1348",
    "DIVISLAB": "10940",
    "APOLLOHOSP": "157",
    "HINDUNILVR": "1394",
    "ITC": "1660",
    "KOTAKBANK": "1922",
    "AXISBANK": "5900",
    "ASIANPAINT": "236",
    "HCLTECH": "7229",
    "ULTRACEMCO": "11532",
    "BAJAJFINSV": "16675",
    "BAJFINANCE": "317",
    "NESTLEIND": "17963",
    "GRASIM": "1232",
    "TATACONSUM": "3432",
    "BAJAJ-AUTO": "16669",
    "HINDALCO": "1363",
    "INDUSINDBK": "5258",
    "SBILIFE": "21808",
    "HDFCLIFE": "467",
}

class AngelOneService:
    """Singleton service for Angel One SmartAPI authentication & market quotes."""
    
    def __init__(self):
        self.api_key = os.getenv("ANGEL_API_KEY", "KvtCKM7Z")
        self.client_id = os.getenv("ANGEL_CLIENT_ID", "A291133")
        self.password = os.getenv("ANGEL_PASSWORD", "9595")
        self.totp_secret = os.getenv("ANGEL_TOTP_SECRET", "PX6O7SGZR2DG6GEQDB7XRNCZGY")
        
        self.jwt_token: Optional[str] = None
        self.feed_token: Optional[str] = None
        self.token_expiry: float = 0
        self.base_url = "https://apiconnect.angelbroking.com"

    def is_configured(self) -> bool:
        """Return True if Angel One credentials are present."""
        return bool(self.api_key and self.client_id)

    def login(self) -> bool:
        """Authenticate with Angel One SmartAPI and cache JWT Bearer Token."""
        if not self.is_configured():
            return False

        # Return active token if valid for > 5 minutes
        if self.jwt_token and time.time() < (self.token_expiry - 300):
            return True

        totp_code = generate_totp(self.totp_secret)
        url = f"{self.base_url}/rest/secure/angelbroking/user/v1/loginByPassword"
        
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-UserType": "USER",
            "X-SourceID": "WEB",
            "X-ClientLocalIP": "192.168.1.1",
            "X-ClientPublicIP": "106.193.147.98",
            "X-MACAddress": "fe80::1031:3bf1:49a:2d14",
            "X-PrivateKey": self.api_key,
        }
        
        body = {
            "clientcode": self.client_id,
            "password": self.password,
            "totp": totp_code,
        }

        try:
            r = requests.post(url, json=body, headers=headers, timeout=5)
            if r.status_code == 200:
                res = r.json()
                if res.get("status") and res.get("data"):
                    data = res["data"]
                    self.jwt_token = data.get("jwtToken")
                    self.feed_token = data.get("feedToken")
                    # Valid for 24 hours
                    self.token_expiry = time.time() + 86400
                    logger.info("Angel One SmartAPI authenticated successfully for client %s", self.client_id)
                    return True
                else:
                    logger.warning("Angel One login failed: %s", res.get("message"))
            else:
                logger.warning("Angel One HTTP login status %s: %s", r.status_code, r.text)
        except Exception as e:
            logger.warning("Angel One login exception: %s", e)

        return False

    def get_ltp(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Fetch live Last Traded Price (LTP) quote from Angel One SmartAPI."""
        clean_sym = symbol.upper().replace(".NS", "")
        token = SYMBOL_TOKEN_MAP.get(clean_sym)
        if not token:
            return None

        if not self.login():
            return None

        url = f"{self.base_url}/rest/secure/angelbroking/order/v1/getLtpData"
        headers = {
            "Authorization": f"Bearer {self.jwt_token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-UserType": "USER",
            "X-SourceID": "WEB",
            "X-ClientLocalIP": "192.168.1.1",
            "X-ClientPublicIP": "106.193.147.98",
            "X-MACAddress": "fe80::1031:3bf1:49a:2d14",
            "X-PrivateKey": self.api_key,
        }
        
        body = {
            "exchange": "NSE",
            "tradingsymbol": f"{clean_sym}-EQ",
            "symboltoken": token,
        }

        try:
            r = requests.post(url, json=body, headers=headers, timeout=4)
            if r.status_code == 200:
                res = r.json()
                if res.get("status") and res.get("data"):
                    d = res["data"]
                    price = float(d.get("ltp") or d.get("close") or 0)
                    if price > 0:
                        return {
                            "symbol": clean_sym,
                            "price": price,
                            "open": float(d.get("open") or price),
                            "high": float(d.get("high") or price),
                            "low": float(d.get("low") or price),
                            "close": float(d.get("close") or price),
                            "data_source": "angel_one",
                        }
        except Exception as e:
            logger.warning("Angel One get_ltp error for %s: %s", clean_sym, e)

        return None

# Singleton Instance
angel_one_service = AngelOneService()
