

import json
import os
import time
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage, AssistantMessage
from azure.core.credentials import AzureKeyCredential

endpoint = "https://models.inference.ai.azure.com"
model_name = "mistral-small-2503"
token = os.environ["GITHUB_TOKEN"]
client = ChatCompletionsClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(token),
)

def save_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

answer = []
output_filename = "chunk_qa_pair_1.josn"

txt_files = sorted([f for f in os.listdir("chunks") if f.startswith("chunk_") and f.endswith(".txt")])

total_files = len(txt_files)
print(f"Processing {total_files} files...\n")

for idx, filename in enumerate(txt_files, start=1):
    file_path = os.path.join("chunks/", filename)
    
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    print(f"Processing file {idx}/{total_files}: {filename}")
    
    response = client.complete(
    messages=[
                SystemMessage("You are an AI trained to generate factual question-answer pairs from the provided agricultural {text}"),
                UserMessage("""From this corpus of text: Agriculture is the primary sector of many economies, providing food, raw materials, and employment opportunities. It includes activities such as crop cultivation, animal husbandry, fisheries, and forestry. With advancements in technology, modern agriculture has adopted practices like precision farming, genetically modified crops, and sustainable irrigation techniques.
        Soil health plays a crucial role in agricultural productivity. Farmers use fertilizers, crop rotation, and organic farming techniques to maintain soil fertility. Water management, including irrigation and rainwater harvesting, is essential in ensuring consistent crop yields, especially in drought-prone regions.
        Pests and diseases pose significant challenges to agriculture. Farmers use pesticides, biological control methods, and integrated pest management strategies to protect their crops. Additionally, climate change impacts agricultural production through unpredictable weather patterns, rising temperatures, and increased occurrences of droughts and floods.
        Governments and international organizations support agriculture through subsidies, research funding, and policies that promote sustainable farming practices. Agricultural markets and supply chains are crucial for ensuring that farmers receive fair prices for their produce and that consumers have access to affordable food.
        Generate 10 Question Answer pair in json format."""),
                AssistantMessage("""{ Q: What are the key activities included in agriculture?
                            A: Agriculture includes crop cultivation, animal husbandry, fisheries, and forestry.
                            Q: How does modern agriculture improve productivity?
                            A: Modern agriculture uses precision farming, genetically modified crops, and sustainable irrigation techniques.
                            Q: Why is soil health important in agriculture?
                            A: Soil health is crucial for maintaining agricultural productivity by providing essential nutrients to crops.
                            Q: What methods are used to maintain soil fertility?
                            A: Farmers use fertilizers, crop rotation, and organic farming techniques.
                            Q: How does water management help agriculture?
                            A: Irrigation and rainwater harvesting ensure consistent crop yields, especially in drought-prone areas.
                            Q: What are the major challenges faced in agriculture?
                            A: Major challenges include pests, diseases, climate change, and unpredictable weather patterns.
                            Q: How do farmers protect crops from pests?
                            A: They use pesticides, biological control methods, and integrated pest management strategies.
                            Q: How does climate change affect agriculture?
                            A: It causes unpredictable weather, rising temperatures, droughts, and floods, impacting crop yields.
                            Q: How do governments support agriculture?
                            A: Governments provide subsidies, research funding, and policies promoting sustainable farming.
                            Q: Why are agricultural markets and supply chains important?
                            A: They ensure fair prices for farmers and affordable food for consumers.}"""),
                UserMessage(f"From this corpus of text: {content}, generate 10 question answer pairs in json format"),
            ],
        temperature=0.6,
        top_p=0.8,
        max_tokens=2000,
        model=model_name
    )
    
    qa_pairs = response.choices[0].message.content
    answer.append(qa_pairs)

    save_json(answer, output_filename)
    print(f"Saved progress to {output_filename}")

    
    time.sleep(1)
print("Processing complete. All results saved.")
