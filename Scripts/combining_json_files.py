import json
import re
import os

directory = "all_chunks_qa_pair_json_file"
combined_data = []

for i in range(1, 54):
    file_path = os.path.join(directory, f"chunk_qa_pair_{i}.json")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

            if isinstance(data, list) and isinstance(data[0], dict) and "Q" in data[0] and "A" in data[0]:
                combined_data.extend(data)

            elif isinstance(data, list) and isinstance(data[0], str):
                raw_text = "\n".join(data)

                raw_text = re.sub(r"\d+\.\s+\*\*Question:\*\*", "**Question:**", raw_text)
                raw_text = re.sub(r"\n\s+", " ", raw_text)

                qa_pairs = re.findall(
                    r"\*\*Question:\*\* (.*?)\s+\*\*Answer:\*\* (.*?)(?=\*\*Question:|\Z)",
                    raw_text, re.DOTALL
                )

                cleaned_pairs = [{"Q": q.strip(), "A": a.strip()} for q, a in qa_pairs]
                combined_data.extend(cleaned_pairs)

            else:
                print(f"Skipping unrecognized format in {file_path}")

    except Exception as e:
        print(f"Error processing {file_path}: {e}")

with open("combined_cleaned_qa2.json", "w", encoding="utf-8") as out_file:
    json.dump(combined_data, out_file, indent=2, ensure_ascii=False)

print(f"Total question-answer pairs: {len(combined_data)}")