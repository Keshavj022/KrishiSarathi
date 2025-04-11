import openai
import json
import os
import time

openai.api_key = "api-key"

def save_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

answer = []
output_filename = "kvk_data49.json"

txt_files = sorted([f for f in os.listdir("chunks6") if f.startswith("chunk_") and f.endswith(".txt")])

print(f"Processing {len(txt_files)} files...\n")

for idx, filename in enumerate(txt_files, start=1):
    file_path = os.path.join("chunks6", filename)
    
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    print(f"Processing file {idx}/{len(txt_files)}: {filename}")
    
    prompt = f"""
You are an AI trained to generate 10 factual question-answer pairs from the provided agricultural content.

Text:
\"\"\"
{content}
\"\"\"
"""
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You generate 10 agricultural question-answer pairs from given content."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=1500,
    )

    qa_json = response['choices'][0]['message']['content']
    answer.append(qa_json)
    save_json(answer, output_filename)
    print(f"Saved progress to {output_filename}")
    
    time.sleep(1)

print("Processing complete.")