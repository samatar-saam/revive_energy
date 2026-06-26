# backend/services/mpesa.py

import base64
import requests
from datetime import datetime
from flask import current_app


class MpesaService:
    """
    M-Pesa Daraja service for STK Push payments.
    No credentials are hardcoded. Everything comes from config.py / .env.
    """

    @staticmethod
    def _get_config_value(key, required=True, default=None):
        value = current_app.config.get(key, default)

        if required and (value is None or value == ""):
            raise ValueError(f"Missing M-Pesa config value: {key}")

        return value

    @staticmethod
    def _base_url():
        base_url = current_app.config.get("MPESA_BASE_URL")

        if not base_url:
            env = (
                current_app.config.get("MPESA_ENV")
                or current_app.config.get("MPESA_ENVIRONMENT")
                or "sandbox"
            )

            if str(env).lower() == "production":
                base_url = "https://api.safaricom.co.ke"
            else:
                base_url = "https://sandbox.safaricom.co.ke"

        return str(base_url).rstrip("/")

    @staticmethod
    def _normalize_phone(phone):
        if not phone:
            raise ValueError("Phone number is required")

        phone = str(phone).strip().replace(" ", "").replace("-", "").replace("+", "")

        if phone.startswith("07") or phone.startswith("01"):
            phone = "254" + phone[1:]

        elif phone.startswith("7") or phone.startswith("1"):
            phone = "254" + phone

        if not phone.startswith("254"):
            raise ValueError("Phone number must start with 254, 07, or 01")

        if len(phone) != 12:
            raise ValueError("Invalid phone number. Use 2547XXXXXXXX or 07XXXXXXXX")

        return phone

    @staticmethod
    def get_access_token():
        consumer_key = MpesaService._get_config_value("MPESA_CONSUMER_KEY")
        consumer_secret = MpesaService._get_config_value("MPESA_CONSUMER_SECRET")

        url = f"{MpesaService._base_url()}/oauth/v1/generate?grant_type=client_credentials"

        try:
            response = requests.get(
                url,
                auth=(consumer_key, consumer_secret),
                timeout=30,
            )
        except requests.RequestException as e:
            raise Exception(f"Could not connect to M-Pesa token endpoint: {str(e)}")

        print("\n========== M-PESA TOKEN REQUEST ==========")
        print("URL:", url)
        print("Status Code:", response.status_code)
        print("Response:", response.text)
        print("==========================================\n")

        if response.status_code != 200:
            raise Exception(
                f"M-Pesa authentication failed ({response.status_code}): {response.text}"
            )

        try:
            data = response.json()
        except ValueError:
            raise Exception(
                f"Invalid response from M-Pesa token endpoint: {response.text}"
            )

        access_token = data.get("access_token")

        if not access_token:
            raise Exception(f"M-Pesa access token missing in response: {data}")

        return access_token

    @staticmethod
    def stk_push(phone, amount, description, payment_id):
        phone = MpesaService._normalize_phone(phone)

        shortcode = str(MpesaService._get_config_value("MPESA_SHORTCODE"))
        passkey = MpesaService._get_config_value("MPESA_PASSKEY")
        callback_url = MpesaService._get_config_value("MPESA_CALLBACK_URL")

        transaction_type = MpesaService._get_config_value(
            "MPESA_TRANSACTION_TYPE",
            required=False,
            default="CustomerPayBillOnline",
        )

        account_prefix = MpesaService._get_config_value(
            "MPESA_ACCOUNT_PREFIX",
            required=False,
            default="REVIVE",
        )

        try:
            amount = int(round(float(amount)))
        except Exception:
            raise ValueError("Invalid M-Pesa amount")

        if amount <= 0:
            raise ValueError("Amount must be greater than 0")

        access_token = MpesaService.get_access_token()

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        password_raw = f"{shortcode}{passkey}{timestamp}"
        password = base64.b64encode(password_raw.encode("utf-8")).decode("utf-8")

        url = f"{MpesaService._base_url()}/mpesa/stkpush/v1/processrequest"

        payload = {
            "BusinessShortCode": shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": transaction_type,
            "Amount": amount,
            "PartyA": phone,
            "PartyB": shortcode,
            "PhoneNumber": phone,
            "CallBackURL": callback_url,
            "AccountReference": f"{account_prefix}{payment_id}",
            "TransactionDesc": description or "ReVive Energy Payment",
        }

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=30,
            )
        except requests.RequestException as e:
            raise Exception(f"Could not connect to M-Pesa STK Push endpoint: {str(e)}")

        print("\n========== M-PESA STK PUSH REQUEST ==========")
        print("URL:", url)
        print("Status Code:", response.status_code)
        print("Payload:", {
            **payload,
            "Password": "***hidden***",
        })
        print("Response:", response.text)
        print("=============================================\n")

        try:
            data = response.json()
        except ValueError:
            raise Exception(
                f"Invalid response from M-Pesa STK Push endpoint: {response.text}"
            )

        if response.status_code not in [200, 201]:
            raise Exception(
                data.get("errorMessage")
                or data.get("ResponseDescription")
                or f"M-Pesa STK Push failed: {data}"
            )

        return data

    @staticmethod
    def extract_callback_items(callback_metadata):
        items = callback_metadata.get("Item", []) if callback_metadata else []
        result = {}

        for item in items:
            name = item.get("Name")
            value = item.get("Value")

            if name:
                result[name] = value

        return result

    @staticmethod
    def parse_callback(data):
        callback = data.get("Body", {}).get("stkCallback", {})

        result_code = callback.get("ResultCode")
        result_desc = callback.get("ResultDesc")
        merchant_request_id = callback.get("MerchantRequestID")
        checkout_request_id = callback.get("CheckoutRequestID")

        metadata = MpesaService.extract_callback_items(
            callback.get("CallbackMetadata", {})
        )

        return {
            "result_code": result_code,
            "result_desc": result_desc,
            "merchant_request_id": merchant_request_id,
            "checkout_request_id": checkout_request_id,
            "amount": metadata.get("Amount"),
            "mpesa_receipt": metadata.get("MpesaReceiptNumber"),
            "transaction_date": metadata.get("TransactionDate"),
            "phone_number": metadata.get("PhoneNumber"),
            "raw": data,
        }


def get_access_token():
    return MpesaService.get_access_token()


def stk_push(phone, amount, description, payment_id):
    return MpesaService.stk_push(phone, amount, description, payment_id)


def mpesa_callback_handler(data):
    return MpesaService.parse_callback(data)