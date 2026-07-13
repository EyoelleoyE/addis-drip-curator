# verify_receipt.py
import sys
import json
from ethiobank_receipts import extract_receipt

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing parameters. Required: bank type and reference/url"}))
        return

    bank_type = sys.argv[1] # "tele" or "cbe"
    identifier = sys.argv[2] # The transaction ID or URL

    try:
        # Extract metadata from the banking portal
        result = extract_receipt(bank_type, identifier)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
