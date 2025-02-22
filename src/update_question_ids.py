import json
import os
from pathlib import Path
from collections import OrderedDict

def load_id_mappings():
    """Load the ID mappings from data/idMappings.json"""
    with open('data/idMappings.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def update_question_file(file_path, subject_name, chapter_name, id_mappings):
    """Update a single question file with new subject and chapter IDs"""
    try:
        # Read the existing question data with UTF-8 encoding
        with open(file_path, 'r', encoding='utf-8') as f:
            question_data = json.load(f)
        
        # Get the new IDs from the mappings
        new_subject_id = id_mappings['subjects'].get(subject_name)
        new_chapter_id = id_mappings['chapters'].get(chapter_name)
        
        if new_subject_id is None:
            print(f"Warning: Subject '{subject_name}' not found in mappings")
            return
        if new_chapter_id is None:
            print(f"Warning: Chapter '{chapter_name}' not found in mappings")
            return
        
        # Create new ordered dictionary with subjects and chapters first
        ordered_data = OrderedDict()
        ordered_data['subjects'] = [new_subject_id]
        ordered_data['chapters'] = [new_chapter_id]
        
        # Add all other fields in their original order
        for key, value in question_data.items():
            if key not in ['subjects', 'chapters']:
                ordered_data[key] = value
        
        # Write the updated data back to the file with UTF-8 encoding
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(ordered_data, f, indent=2, ensure_ascii=False)
        
        print(f"Updated {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")

def main():
    # Load the ID mappings
    id_mappings = load_id_mappings()
    
    # Get the Questions directory path
    questions_dir = Path('Questions')
    
    # Traverse the Questions directory
    for subject_dir in questions_dir.iterdir():
        if not subject_dir.is_dir():
            continue
            
        subject_name = subject_dir.name
        
        for chapter_dir in subject_dir.iterdir():
            if not chapter_dir.is_dir():
                continue
                
            chapter_name = chapter_dir.name
            
            # Process all JSON files in the chapter directory
            for question_file in chapter_dir.glob('*.json'):
                update_question_file(question_file, subject_name, chapter_name, id_mappings)

if __name__ == '__main__':
    main() 