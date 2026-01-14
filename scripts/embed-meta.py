#!/usr/bin/python3
import os
import json
import glob
import re
import requests
from pathlib import Path
from langchain_text_splitters import MarkdownTextSplitter

chunksize = 500
chunkoverlap = 100


def get_decom_storages():

    with open('components/decom-storages.tsx', 'r') as file:
      content = file.read()

    output = ""

    lines = content.split('\n')
    blocks = []
    current_block = []

    for line in lines:
      line = line.strip()
      if line.startswith('server:'):
          if current_block:
              blocks.append(current_block)
          current_block = [line]
      elif current_block:
          current_block.append(line)
      if line.endswith('},'):
          if current_block:
            blocks.append(current_block)
          current_block = []

    def process_block(block):
        processed_block = []
        for line in block:
            line = line.replace("'", "").replace("(", "").replace(")", "").replace("{", "").replace("}", "").replace("[", "").replace("]", "")
            line = line.replace('<a href="', '').replace('">', '')
            line = line.replace('server:', 'Server').replace('rootDirectory:', 'root directory').replace('dueDate:', 'due date')
            processed_block.append(line)
        return processed_block
    
    output = "# Decommissioned storages\n"
    
    final_blocks = []
    for block in blocks:
        processed_block = process_block(block)
        final_block = []
        for line in processed_block:
            if line.startswith('due date') and line.strip() == 'due date---':
                continue
            if line.startswith('note') and line.strip() == 'note,':
                continue
            if sum(c.isalpha() for c in line) >= 2:
                final_block.append(line)
        if final_block:
            final_blocks.append(final_block)
    
    for block in final_blocks:
        server_line = block[0]
        rest_lines = ' '.join(block[1:])
        rest_lines = rest_lines.replace('due date ---, ', '').replace('note: ,', '')
        rest_lines = rest_lines.rstrip().rstrip(',')
        output = output + f"{server_line} {rest_lines}\n"

    return output

def get_frontends():
    with open('components/frontends.tsx', 'r') as file:
      content = file.read()

    output = ""

    # Regulární výraz pro extrakci bloků mezi { a },
    pattern = r"\{([^{}]+)\},"
    matches = re.findall(pattern, content)

    # Klíčová slova k nahrazení
    replacements = {
        "frontendAddress": "Frontend",
        "aliasedAs": "aliased as",
        "nativeHome": "native home",
        "os": "OS",
        "location": "location"
    }

    result = []

    for match in matches:
        # Odstranění čárky z konce extrahovaného textu
        match = match.rstrip(",")
        lines = match.split("\n")
        processed_lines = []

        for line in lines:
            line = line.strip().replace("'", "").replace('"', "")  # Odstranění uvozovek a apostrofů

            for old, new in replacements.items():
                if line.startswith(old):
                    key, value = line.split(":", 1)
                    value = value.strip()
                    if value and old != "note":  # Pokud hodnota není prázdná a není to "note", přidáme řádek
                        processed_lines.append(f"{new} {value}")
                    break

        if processed_lines:
            result.append(" ".join(processed_lines))

    # Výstup
    if result:
        output = "# Frontend servers:\n"
        for entry in result:
            # Odstranění poslední čárky z každého řádku
            output = output + entry.rstrip(',') + "\n"
    else:
        output = output + "\nŽádná odpovídající data nebyla nalezena.\n"

    return output

def get_gpu_clusters():
    with open('components/gpu-clusters.tsx', 'r') as file:
      content = file.read()

    output = ""
    
    # Split content into blocks starting with "cluster:" and ending with "cudnn:"
    blocks = []
    current_block = []
    in_block = False
    
    for line in content.splitlines():
        line = line.strip()
        
        if "cluster:" in line:
            in_block = True
            current_block = [line]
        elif "cudnn:" in line and in_block:
            current_block.append(line)
            blocks.append(current_block)
            in_block = False
        elif in_block:
            current_block.append(line)
    
    # Process each block
    output = "# GPU clusters\n"
    
    for block in blocks:
        processed_lines = []
        
        for line in block:
            # Remove quotes
            line = line.replace('"', '').replace("'", "")
            
            # Replace keywords
            line = line.replace("cluster:", "Cluster")
            line = line.replace("nodes:", "with nodes")
            line = line.replace("gpusPerNode:", "GPUs per nodes")
            line = line.replace("computeCapability:", "compute capability")
            line = line.replace("memGB:", "GPU memory [GB]")
            line = line.replace("cudnn:", "cudnn")
            
            # Skip empty lines or lines with only keywords
            if ":" not in line and not line.strip():
                continue
                
            processed_lines.append(line.strip())
        
        # Join non-empty lines and print as a single line
        non_empty_lines = [line for line in processed_lines if line.strip()]
        if non_empty_lines:
            # Join with spaces
            result_line = " ".join(non_empty_lines)
            
            # Remove the very last comma in the entire line if it exists
            if result_line.rstrip().endswith(","):
                result_line = result_line.rstrip()[:-1]
            
            output = output + result_line + "\n"

    return output 

def get_storages_ssh():
    with open('components/storages-ssh.tsx', 'r') as file:
      content = file.read()

    output = ""

    lines = content.split('\n')
    filtered_lines = []
    
    for line in lines:
        if line.strip().startswith(('storage:', 'serverName:', 'path:', 'example:', '<code>scp')):
            line = line.replace('"', '')
            line = line.replace("'", "")
            line = line.replace('storage:', 'Storage')
            line = line.replace('serverName:', 'server name')
            line = line.replace('path:', 'path')
            line = line.replace('<code>', '')
            line = line.replace('</code>', '')
            if line.startswith('example:') and '(' in line:
                line = 'example:'
            filtered_lines.append(line.strip())
    
    output = "# Storages - ssh access\n"
    
    storages = {}
    current_storage = None
    
    for line in filtered_lines:
        if line.startswith('Storage'):
            current_storage = line
            storages[current_storage] = [line]
        elif current_storage:
            if line.startswith('example:') and storages[current_storage][-1].startswith('example:'):
                continue
            storages[current_storage].append(line)
    
    for storage in sorted(storages.keys()):
        output_lines = []
        scp_lines = []
        for line in storages[storage]:
            if line.startswith('scp'):
                scp_lines.append(line.strip())
            else:
                output_lines.append(line)
        if scp_lines:
            example_line_index = -1
            for i, line in enumerate(output_lines):
                if line.startswith('example:'):
                    example_line_index = i
                    break
            if example_line_index != -1:
                output_lines[example_line_index] = 'example: ' + ' or '.join(scp_lines)
            else:
                output_lines.append('scp ' + ' or '.join(scp_lines))
        final_output = ' '.join(output_lines)
        if final_output.endswith(','):
            final_output = final_output[:-1]
        if 'du-cesnet' not in final_output:
            output = output + final_output + "\n"

    return output

def get_storages():
 
    with open('components/storages.tsx', 'r') as file:
      content = file.read()

    output = ""

    lines = content.split('\n')
    
    output = "# Storages\n"
    
    for line in lines:
        line = line.strip()
        if line.startswith("{ server:") or line.startswith("{ class:"):
            # Odstranění uvozovek a závorek
            line = line.replace("{", "").replace("}", "").replace("\"", "")
            # Náhrady požadovaných textů
            line = line.replace("server:", "Server")
            line = line.replace("directory:", "home directory")
            line = line.replace("backupClass:", "backup class")
            line = line.replace("class:", "Backup class")
            
            # Odstranění první mezery před 'Server'
            line = line.lstrip()
            
            # Odstranění poslední čárky, pokud existuje
            if line.endswith(","):
                line = line[:-1]
            
            # Odstranění uvozovek
            line = line.replace("'", "")
            
            # Odstranění položky 'note:', pokud je prázdná
            parts = line.split(",")
            filtered_parts = [p for p in parts if not p.strip().startswith("note:") or len(p.strip()) > 5]
            line = ",".join(filtered_parts)
            
            output = output + line + "\n"
    return output

def process_meta(base_path, lang, current_dir=""):
    # Determine the correct meta filename based on language
    meta_file = "meta.cz.json" if lang == "cz" else "meta.json"
    meta_path = os.path.join(base_path, current_dir, meta_file)

    if not os.path.exists(meta_path):
        return []
    
    try:
        with open(meta_path, "r") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        return []

    results = []
    for item in data.get("pages", []):
        # Construct full path for current item
        full_item_path = os.path.join(base_path, current_dir, item)
        
        # Check for file existence
        if lang == "en":
            file_candidate = f"{full_item_path}.mdx"
        else:
            file_candidate = f"{full_item_path}.cz.mdx"
        
        if os.path.isfile(file_candidate):
            results.append(os.path.relpath(file_candidate, base_path).replace("\\", "/"))
            continue
        
        # Handle directory case
        dir_meta_path = os.path.join(full_item_path, "meta.cz.json" if lang == "cz" else "meta.json")
        if os.path.isdir(full_item_path) and os.path.exists(dir_meta_path):
            nested_dir = os.path.join(current_dir, item) if current_dir else item
            results.extend(process_meta(base_path, lang, nested_dir))
    
    return results

# Mapping of table components to their corresponding script filenames
TABLE_SCRIPT_MAPPING = {
    '<DecommissionedServersTable/>': get_decom_storages(),
    '<FrontendTable/>': get_frontends(),
    '<StorageTable/>': get_storages(),
    '<GPUClusterTable/>': get_gpu_clusters(),
    '<StorageSSHTable/>': get_storages_ssh()
}

def main():
    base_dir = "content/docs"
    all_files = []
    all_chunks = []
    
    for meta_path in glob.glob(os.path.join(base_dir, "meta*.json")):
        # Determine language from filename
        filename = os.path.basename(meta_path)
        lang = "cz" if filename == "meta.cz.json" else "en"
        if lang == "cz":
           continue
        
        # Process the meta file and its hierarchy
        found_files = process_meta(base_dir, lang)
        all_files.extend(found_files)

    # Remove duplicates and sort
    unique_files = sorted(set(all_files))
    
    # Print results
    for file_path in unique_files:
        path_obj = Path(os.path.join(base_dir,file_path))
        with open(os.path.join(base_dir,file_path), "r", encoding="utf-8") as f:
            content = f.read()

        for component, inline_text in TABLE_SCRIPT_MAPPING.items():
            if component in content:
                # Replace the component with the script contents
                content = content.replace(component, inline_text)

        filename = file_path.split("/")[-1]
        lang_prefix = "cz" if ".cz.mdx" in filename else "en"
        doc_id = file_path.replace("index.mdx", "").rstrip("/")
        if lang_prefix == "cz":
            metadata_path = "/" + lang_prefix + "/docs/" + doc_id.replace(".cz.mdx", "")
        else:
            metadata_path = "/" + lang_prefix + "/docs/" + doc_id.replace(".mdx", "")

        # Extract title from first # heading
        title = ""
        for line in content.split("\n"):
            if line.startswith("title: "):
                title = line.replace("title: ", "", 1).strip()
                break

        # 2. Preprocess content
        # Convert HTML tags to spaces
        cleaned = re.sub(r"<[^>]+>", " ", content, flags=re.IGNORECASE)
        # Collapse whitespace
        cleaned = re.sub(r"\s+", " ", cleaned).strip()

        # 3. Split with MarkdownTextSplitter
        splitter = MarkdownTextSplitter(
            chunk_size=chunksize,
            chunk_overlap=chunkoverlap,
        )
        chunks = splitter.create_documents([cleaned])

        # Add metadata to chunks
        for i, chunk in enumerate(chunks):
            all_chunks.append({
                "data": chunk.page_content,
                "metadata": {
                    "path": metadata_path,
                    "title": title,
                    "chunknum": i,
                    "lang": lang_prefix
                }
            })

        # 4. Upload to EMBEDURL
        embed_url = os.environ.get("EMBEDURL")
        if not embed_url:
            embed_url = "https://embedbase-ol.dyn.cloud.e-infra.cz/v1/ceritsc-documentation"

        chunk_count = len(all_chunks)
        response = requests.post(
            embed_url,
            json={"documents": all_chunks},
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        print(f"Uploaded {chunk_count} chunks")

if __name__ == "__main__":
    main()
