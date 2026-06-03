# Binance Futures Testnet Trading Bot

A lightweight, well-structured Python CLI application to place Market and Limit orders on the Binance Futures Testnet (USDT-M).

## Setup & Installation

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set your Binance Futures Testnet API credentials as environment variables:
   ```bash
   # Mac/Linux
   export BINANCE_TESTNET_API_KEY="your_api_key_here"
   export BINANCE_TESTNET_API_SECRET="your_api_secret_here"
   
   # Windows (PowerShell)
   $env:BINANCE_TESTNET_API_KEY="your_api_key_here"
   $env:BINANCE_TESTNET_API_SECRET="your_api_secret_here"
   ```

## How to Run Examples

**1. Place a Market Buy Order:**
```bash
python cli.py --symbol BTCUSDT --side BUY --type MARKET --quantity 0.01
```

**2. Place a Limit Sell Order:**
```bash
python cli.py --symbol ETHUSDT --side SELL --type LIMIT --quantity 0.1 --price 3500
```

## Architecture & Considerations
- **No external SDK bloat**: Implements a clean, bare-metal REST client using `requests` with direct HMAC SHA256 signature generation to demonstrate complete API architecture understanding.
- **Modular Design**: Separates execution logic (`cli.py`), network communication (`client.py`), business logic (`orders.py`), and safety validations (`validators.py`).
- **Robust Error Handling**: Safely catches HTTP errors from Binance and prints user-friendly messaging to stderr on validation failures.
- **Dual Logging**: Logs every execution locally to `trading_bot.log` and streams high-level output to the console.
