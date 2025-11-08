import requests

API_URL = "https://www.ismailfaiz.com/api/chat"

# Text chat function
def chat(messages):
    payload = {"messages": messages}
    response = requests.post(API_URL, json=payload)
    raw = response.text
    # Parse lines like 0:"..."
    lines = raw.splitlines()
    # Extract and join values, handling spaces and numbers
    values = [line.split(":", 1)[1].strip().strip('"') for line in lines if ":" in line]
    # Remove empty strings and join with no extra spaces
    bot_reply = "".join(values)
    return {"bot_reply": bot_reply}

# Image sending function
def send_image(image_path):
    with open(image_path, 'rb') as img_file:
        files = {'file': (image_path, img_file, 'image/png')}
        response = requests.post(API_URL, files=files)
        print("Image response:", response.text)
        return response.text

if __name__ == "__main__":
    messages = [
        {"role": "system", "content": "You are a helpful assistant."}
    ]
    while True:
        user_input = input("You: ")
        if user_input.strip().lower() == "send image":
            send_image("random.png")
        else:
            messages.append({"role": "user", "content": user_input})
            reply = chat(messages)
            print("Bot:", reply.get("bot_reply", "No response"))
            # Optionally, append bot reply to messages for context
            if "choices" in reply and reply["choices"]:
                messages.append(reply["choices"][0]["message"])