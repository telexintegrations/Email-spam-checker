# Telex Blacklist Checker Integration

This Node.js/Express integration for Telex checks an IP address against the Blacklist Checker service, filters the results, and sends a formatted message to a Telex webhook. The integration performs the following steps:

- **Extracts** the IP address from the incoming payload (or from the `message` field).
- **Validates** that the IP is in proper IPv4 format.
- **Sends** a GET request to the Blacklist Checker endpoint.
- **Filters** the response to count how many blacklists have `detected: true`.
- **Constructs a message**:
  - If one or more lists detected the IP, the message reads:  
    _"Very possibly scam, detected on X site(s)"_
  - Otherwise, it reads:  
    _"its not a scam ip"_
- **Sends** this message (along with other details) as a POST request to the Telex webhook URL.
- **Returns** the same message and blacklist details in its own response.

## Prerequisites

- [Node.js](https://nodejs.org/) (v12 or above)
- npm (bundled with Node.js)

## Installation

1. **Clone or Download** this repository to your local machine.
2. **Navigate** to the project directory.
3. **Install dependencies** by running:

   ```bash
   npm install express axios

Configuration

The integration uses the following configuration values:

Telex Webhook URL: https://ping.telex.im/v1/webhooks/0195137e-85ee-7fb1-b497-f76823035cf9
You can update these values directly in the source code if needed.

Running the Server

To start the server, run:

node server.js
The server will listen on port 3000 by default, or you can override it with the PORT environment variable.

How It Works

IP Extraction & Validation:
The server expects a JSON payload that may include an "ip" field. If not present, it attempts to extract an IPv4 address from the "message" field by stripping HTML tags. The extracted IP is then validated using a regular expression.
Blacklist Check:
A GET request is sent to the Blacklist Checker endpoint:
https://api.blacklistchecker.com/check/{ip}
Basic authentication is used with your API key as the username (and an empty password).
Response Processing:
The response from Blacklist Checker includes a blacklists array. The code filters this array to only include items where detected is true and counts the number of detections.
If detections are found, a message is constructed:
"Very possibly scam, detected on X site(s)"
Otherwise, the message is:
"its not a scam ip"
Webhook Notification:
The integration sends a POST request to the Telex webhook with a JSON payload containing:
event_name
message (formatted based on detection results)
status
username
Final Response:
The integration returns a JSON response with the constructed message and details of the detected blacklists.
Testing the Integration

You can test the integration by sending a POST request to your server. For example, using curl:

curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{"ip": "185.220.101.70"}'
If the payload lacks an "ip" field, the integration will attempt to extract one from the "message" field.

Telex Integration Documentation

For more information on how to build and integrate with Telex, refer to:

Telex Documentation
Telex Integrations Overview
Telex API Documentation
License

This project is licensed under the MIT License.

Author

Gideon ELorm