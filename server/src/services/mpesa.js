import crypto from 'crypto';

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || 'your_consumer_key';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || 'your_consumer_secret';
const SHORTCODE = process.env.MPESA_SHORTCODE || '174379';
const PASSKEY = process.env.MPESA_PASSKEY || 'your_passkey';
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || 'https://your-domain.com/api/mpesa/callback';
const B2C_CALLBACK_URL = process.env.MPESA_B2C_CALLBACK_URL || 'https://your-domain.com/api/mpesa/b2c-callback';
const INITIATOR_NAME = process.env.MPESA_INITIATOR_NAME || 'testapi';
const INITIATOR_PASSWORD = process.env.MPESA_INITIATOR_PASSWORD || 'your_security_credential';

const BASE_URL = 'https://sandbox.safaricom.co.ke';
const PRODUCTION_URL = 'https://api.safaricom.co.ke';

function getBaseUrl() {
  return process.env.NODE_ENV === 'production' ? PRODUCTION_URL : BASE_URL;
}

async function getAccessToken() {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  
  const response = await fetch(`${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: `Basic ${auth}`
    }
  });
  
  const data = await response.json();
  
  if (data.access_token) {
    return data.access_token;
  }
  
  throw new Error('Failed to get access token: ' + JSON.stringify(data));
}

function generateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function generatePassword(shortcode, passkey, timestamp) {
  return crypto.createHash('sha256').update(`${shortcode}${passkey}${timestamp}`).digest('base64');
}

async function stkPush(phone, amount, orderId) {
  const token = await getAccessToken();
  const timestamp = generateTimestamp();
  const password = generatePassword(SHORTCODE, PASSKEY, timestamp);
  
  const payload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.ceil(amount),
    PartyA: phone,
    PartyB: SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: CALLBACK_URL,
    AccountReference: orderId,
    TransactionDesc: `Ganji Deposit - ${orderId}`
  };
  
  const response = await fetch(`${getBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

async function queryTransaction(checkoutRequestId) {
  const token = await getAccessToken();
  const timestamp = generateTimestamp();
  const password = generatePassword(SHORTCODE, PASSKEY, timestamp);
  
  const payload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId
  };
  
  const response = await fetch(`${getBaseUrl()}/mpesa/stkpushquery/v1/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

async function b2cPayment(phone, amount, occasion = 'Withdrawal') {
  const token = await getAccessToken();
  const securityCredential = generateSecurityCredential(INITIATOR_PASSWORD);
  
  const payload = {
    InitiatorName: INITIATOR_NAME,
    SecurityCredential: securityCredential,
    CommandID: 'BusinessPayment',
    Amount: Math.ceil(amount),
    PartyA: SHORTCODE,
    PartyB: phone,
    Remarks: `Ganji Withdrawal`,
    QueueTimeOutURL: `${B2C_CALLBACK_URL}/timeout`,
    ResultURL: `${B2C_CALLBACK_URL}/result`,
    Occasion: occasion
  };
  
  const response = await fetch(`${getBaseUrl()}/mpesa/b2b.v1/paymentrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

function generateSecurityCredential(password) {
  const encrypted = crypto.publicEncrypt(
    {
      key: Buffer.from(getSecurityCredentialBase64(), 'base64'),
      padding: crypto.constants.RSA_PKCS1_PADDING
    },
    Buffer.from(password)
  );
  return encrypted.toString('base64');
}

function getSecurityCredentialBase64() {
  const cert = process.env.MPESA_CERTIFICATE || '';
  return cert;
}

async function registerUrls() {
  const token = await getAccessToken();
  
  const payload = {
    ShortCode: SHORTCODE,
    ResponseType: 'Completed',
    ConfirmationURL: CALLBACK_URL,
    ValidationURL: CALLBACK_URL
  };
  
  const response = await fetch(`${getBaseUrl()}/mpesa/c2b/v1/registerurl`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

function reverseMpesaTransaction(transactionId, amount, phone) {
  return {
    status: 'pending',
    message: 'Reversal not implemented - requires B2B API'
  };
}

export {
  stkPush,
  queryTransaction,
  b2cPayment,
  registerUrls,
  getAccessToken,
  generateTimestamp,
  generatePassword
};
