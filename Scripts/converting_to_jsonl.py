import json
import random
from sklearn.model_selection import train_test_split

with open('all_qa_pairs.json', 'r') as f:
    data = json.load(f)

jsonl_data = []
for item in data:
    jsonl_data.append(json.dumps(item))

train_data, temp_data = train_test_split(jsonl_data, test_size=0.2, random_state=42)
val_data, test_data = train_test_split(temp_data, test_size=0.5, random_state=42)

with open('train.jsonl', 'w') as f:
    f.write('\n'.join(train_data))

with open('test.jsonl', 'w') as f:
    f.write('\n'.join(test_data))

with open('validation.jsonl', 'w') as f:
    f.write('\n'.join(val_data))

print(f"Created train.jsonl with {len(train_data)} examples")
print(f"Created test.jsonl with {len(test_data)} examples")
print(f"Created validation.jsonl with {len(val_data)} examples")

input_train_file = "train.jsonl"
output_train_file = "train_openai.jsonl"
input_val_file = "validation.jsonl"
output_val_file = "validation_openai.jsonl"

with open(input_train_file, "r") as infile, open(output_train_file, "w") as outfile:
    for line in infile:
        item = json.loads(line)
        messages = [
            {"role": "user", "content": item["Q"]},
            {"role": "assistant", "content": item["A"]}
        ]
        json.dump({"messages": messages}, outfile)
        outfile.write("\n")

with open(input_val_file, "r") as infile, open(output_val_file, "w") as outfile:
    for line in infile:
        item = json.loads(line)
        messages = [
            {"role": "user", "content": item["Q"]},
            {"role": "assistant", "content": item["A"]}
        ]
        json.dump({"messages": messages}, outfile)
        outfile.write("\n")

print("Created OpenAI compatible train and validation file")