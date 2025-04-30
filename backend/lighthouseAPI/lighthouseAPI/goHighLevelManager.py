import requests
from datetime import datetime, timedelta, timezone

CONFIG = {
    "HIGHLEVEL_API_KEY": "pit-4e78e9cc-5913-43ca-b6da-027e18d505a7",
    "LOCATION_ID": "k6dX0e4TS7m0WkoGgCrh",
}

def highLevelAPI(data):
    title = data['name'] + "-" + data['phone']
    body = f'''Name: {data["name"]}\nPhone: {data["phone"]}\nEmail: {data['emailid']}\nURL: {data["url"]}
    '''
    createHighlevelTask(title, body)
    createContact(data['name'], data['emailid'], data['phone'])

def tomorrowDateTime():
    now = datetime.now(timezone.utc)
    tomorrow = (now + timedelta(days=1)).replace(hour=23, minute=59, second=0, microsecond=0)
    timestamp = tomorrow.strftime("%Y-%m-%dT%H:%M:%SZ")
    return timestamp

def createHighlevelTask(title, body, createdById="pOwTxr20ekoWIBP3kZRv", assignedToId="FlVZSzaK63ff7b6PrUuJ"):
    url = f"https://services.leadconnectorhq.com/contacts/{createdById}/tasks"

    payload = {
        "title": title,
        "body": body,
        "dueDate": tomorrowDateTime(),
        "completed": False,
        "assignedTo": assignedToId
    }

    headers = {
        "Authorization": f"Bearer {CONFIG.get('HIGHLEVEL_API_KEY')}",
        "Version": "2021-07-28",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)
    if response.status_code in [200, 201]:
        return True, response.json()
    else:
        return False, None

def createContact(name: str, email: str, phone: str):
    url = "https://services.leadconnectorhq.com/contacts/"

    payload = {
        "name": name,
        "email": email,
        "locationId": CONFIG.get("LOCATION_ID"),
        "phone": phone,
    }
    headers = {
        "Authorization": f"Bearer {CONFIG.get('HIGHLEVEL_API_KEY')}",
        "Version": "2021-07-28",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)
