export const pythonSolutionFiles = [
  {
    name: 'README.md',
    language: 'markdown',
    content: `# Binance Futures Testnet Trading Bot

A lightweight, well-structured Python CLI application to place Market and Limit orders on the Binance Futures Testnet (USDT-M).

## Setup & Installation

1. Create a virtual environment:
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   \`\`\`

2. Install the required dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

3. Set your Binance Futures Testnet API credentials as environment variables:
   \`\`\`bash
   # Mac/Linux
   export BINANCE_TESTNET_API_KEY="your_api_key_here"
   export BINANCE_TESTNET_API_SECRET="your_api_secret_here"
   
   # Windows (PowerShell)
   $env:BINANCE_TESTNET_API_KEY="your_api_key_here"
   $env:BINANCE_TESTNET_API_SECRET="your_api_secret_here"
   \`\`\`

## How to Run Examples

**1. Place a Market Buy Order:**
\`\`\`bash
python cli.py --symbol BTCUSDT --side BUY --type MARKET --quantity 0.01
\`\`\`

**2. Place a Limit Sell Order:**
\`\`\`bash
python cli.py --symbol ETHUSDT --side SELL --type LIMIT --quantity 0.1 --price 3500
\`\`\`

## Architecture & Considerations
- **No external SDK bloat**: Implements a clean, bare-metal REST client using \`requests\` with direct HMAC SHA256 signature generation to demonstrate complete API architecture understanding.
- **Modular Design**: Separates execution logic (\`cli.py\`), network communication (\`client.py\`), business logic (\`orders.py\`), and safety validations (\`validators.py\`).
- **Robust Error Handling**: Safely catches HTTP errors from Binance and prints user-friendly messaging to stderr on validation failures.
- **Dual Logging**: Logs every execution locally to \`trading_bot.log\` and streams high-level output to the console.
`,
  },
  {
    name: 'requirements.txt',
    language: 'text',
    content: `requests==2.31.0
urllib3==2.2.1`,
  },
  {
    name: 'bot/__init__.py',
    language: 'python',
    content: `# Trading Bot Package definition
# This file intentionally left blank to make the 'bot' directory a Python module.
`,
  },
  {
    name: 'bot/logging_config.py',
    language: 'python',
    content: `import logging
import sys

def setup_logger(name="trading_bot"):
    """
    Configures and returns a dual-output logger (Console + File).
    """
    logger = logging.getLogger(name)
    
    # Avoid duplicate handlers if logger is requested multiple times
    if logger.hasHandlers():
        return logger
        
    logger.setLevel(logging.INFO)
    
    # Define uniform log formatting
    formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
    )
    
    # 1. Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # 2. File Handler (outputs to trading_bot.log)
    file_handler = logging.FileHandler('trading_bot.log', mode='a')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    return logger
`,
  },
  {
    name: 'bot/client.py',
    language: 'python',
    content: `import os
import time
import hmac
import hashlib
import requests
from urllib.parse import urlencode
from bot.logging_config import setup_logger

logger = setup_logger()

class BinanceFuturesTestnetClient:
    """
    Handles network communication, authentication, and signature generation
    for the Binance Futures Testnet API.
    """
    BASE_URL = "https://testnet.binancefuture.com"

    def __init__(self):
        self.api_key = os.getenv("BINANCE_TESTNET_API_KEY")
        self.api_secret = os.getenv("BINANCE_TESTNET_API_SECRET")

        if not self.api_key or not self.api_secret:
            error_msg = "Missing API credentials. Set BINANCE_TESTNET_API_KEY and BINANCE_TESTNET_API_SECRET."
            logger.critical(error_msg)
            raise ValueError(error_msg)

        logger.info("Initializing connection to Binance Futures Testnet")
        self.session = requests.Session()
        self.session.headers.update({
            "X-MBX-APIKEY": self.api_key,
        })

    def _generate_signature(self, query_string: str) -> str:
        """
        Generates HMAC SHA256 signature required by Binance API.
        """
        return hmac.new(
            self.api_secret.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

    def post(self, endpoint: str, payload: dict) -> dict:
        """
        Sends an authenticated POST request to the specified endpoint.
        """
        # Inject standard timestamp required by all signed endpoints
        payload['timestamp'] = int(time.time() * 1000)
        
        # Format payload to query string and sign
        query_string = urlencode(payload)
        signature = self._generate_signature(query_string)
        
        # Construct the final request URL
        url = f"{self.BASE_URL}{endpoint}?{query_string}&signature={signature}"
        
        try:
            logger.info(f"Sending POST request to {endpoint}")
            response = self.session.post(url)
            
            # Raise HTTPError for bad responses (4xx or 5xx)
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.HTTPError as e:
            # Attempt to extract Binance's specific API error message payload
            error_details = e.response.text
            logger.error(f"Binance API Error: HTTP {e.response.status_code} - {error_details}")
            raise
        except requests.exceptions.RequestException as e:
            logger.error(f"Network Connection Error: {e}")
            raise
`,
  },
  {
    name: 'bot/validators.py',
    language: 'python',
    content: `def validate_order_arguments(symbol: str, side: str, order_type: str, quantity: float, price: float = None):
    """
    Validates user inputs to ensure they meet API requirements before attempting network transmission.
    Raises ValueError on invalid constraints.
    """
    if not symbol:
        raise ValueError("Symbol cannot be empty.")
        
    normalized_side = side.upper()
    if normalized_side not in ["BUY", "SELL"]:
        raise ValueError(f"Invalid side: '{side}'. Side must be strictly 'BUY' or 'SELL'.")
    
    normalized_type = order_type.upper()
    if normalized_type not in ["MARKET", "LIMIT"]:
        raise ValueError(f"Invalid order type: '{order_type}'. Type must be strictly 'MARKET' or 'LIMIT'.")
    
    if quantity <= 0:
        raise ValueError(f"Quantity must be strictly greater than 0 (provided: {quantity}).")
    
    if normalized_type == "LIMIT":
        if price is None or price <= 0:
            raise ValueError(f"Price is mandatory and must be strictly greater than 0 for LIMIT orders.")
            
    return True
`,
  },
  {
    name: 'bot/orders.py',
    language: 'python',
    content: `from bot.client import BinanceFuturesTestnetClient
from bot.logging_config import setup_logger

logger = setup_logger()

class OrderManager:
    """
    Business layer managing trade execution, payload construction, and response parsing.
    """
    
    def __init__(self):
        self.client = BinanceFuturesTestnetClient()

    def place_order(self, symbol: str, side: str, order_type: str, quantity: float, price: float = None):
        endpoint = "/fapi/v1/order"
        
        payload = {
            "symbol": symbol.upper(),
            "side": side.upper(),
            "type": order_type.upper(),
            "quantity": quantity,
        }

        # Inject order-type specific constraints
        if order_type.upper() == "LIMIT":
            payload["price"] = price
            payload["timeInForce"] = "GTC"  # 'Good Till Cancelled' is required for limits

        logger.info(f"Preparing order execution payload: {payload}")
        
        try:
            response = self.client.post(endpoint, payload)
            
            # Print a neat console summary upon successful completion
            self._print_order_summary(response)
            return response
            
        except Exception as e:
            logger.error("Failed to execute place order command.")
            print(f"\\n[ERROR] Order Placement Failed: {e}")
            raise

    def _print_order_summary(self, response: dict):
        """
        Outputs a clean CLI readout mapping the critical order response details.
        """
        print("\\n" + "="*45)
        print("✅ ORDER PLACEMENT SUCCESSFUL")
        print("="*45)
        print(f"Order ID       : {response.get('orderId')}")
        print(f"Symbol         : {response.get('symbol')}")
        print(f"Status         : {response.get('status')}")
        print(f"Type / Side    : {response.get('type')} / {response.get('side')}")
        print(f"Execution Qty  : {response.get('executedQty')} / {response.get('origQty')}")
        
        avg_price = response.get('avgPrice')
        if avg_price and avg_price != "0.00000":
            print(f"Average Price  : {avg_price}")
            
        print("="*45 + "\\n")
`,
  },
  {
    name: 'cli.py',
    language: 'python',
    content: `import argparse
import sys
from bot.orders import OrderManager
from bot.validators import validate_order_arguments
from bot.logging_config import setup_logger

logger = setup_logger()

def main():
    """
    Primary application entrypoint. Uses argparse to orchestrate user CLI arguments.
    """
    parser = argparse.ArgumentParser(
        description="A lightweight Trading Bot mapping to Binance Futures Testnet (USDT-M)",
        formatter_class=argparse.RawTextHelpFormatter
    )
    
    parser.add_argument("--symbol", type=str, required=True, help="Trading pair symbol (Example: BTCUSDT)")
    parser.add_argument("--side", type=str, required=True, choices=["BUY", "SELL", "buy", "sell"], help="Order directional side")
    parser.add_argument("--type", dest='order_type', type=str, required=True, choices=["MARKET", "LIMIT", "market", "limit"], help="Type of execution order")
    parser.add_argument("--quantity", type=float, required=True, help="Number of asset units")
    parser.add_argument("--price", type=float, help="Limit price parameter (strictly required if type is LIMIT)")

    args = parser.parse_args()

    try:
        # Phase 1: Clean and Validate Arguments
        logger.info(f"Received CLI request: {sys.argv[1:]}")
        
        validate_order_arguments(
            symbol=args.symbol,
            side=args.side,
            order_type=args.order_type,
            quantity=args.quantity,
            price=args.price
        )
        
        # Phase 2: Dispatch to the Order Manager for API Transmission
        manager = OrderManager()
        manager.place_order(
            symbol=args.symbol,
            side=args.side,
            order_type=args.order_type,
            quantity=args.quantity,
            price=args.price
        )
        
    except ValueError as ve:
        # Expected failures (validation)
        logger.warning(f"Business Validation Fault: {ve}")
        print(f"\\n[Validation Error] {ve}\\n", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        # Unexpected failures (network, HTTP, API change)
        logger.critical(f"System Execution Error: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
`,
  }
];
