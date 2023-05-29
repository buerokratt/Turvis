#!/bin/bash

root_dir="/app/test"
endpoint=$(cat "$root_dir/.endpoint")
subdirectory="processed"

execute_curl_command() {
    local file="$1"
    local parentdirectory="$2"
    local timestamp="$3"
    
    # Extract the curl command from the file
    curl_command=$(grep -o 'curl .*' "$file")

    # Execute the curl command and retrieve the HTTP status code
    response=$(eval "$curl_command" -s -w "%{http_code}")

    # Extract the HTTP response code
    http_code=${response:(-3)}

    # Extract the response content
    response_content=${response%???}

    mkdir -p "$parentdirectory/$http_code"
    filename=$(basename "$file")
    echo "$response_content" > "$parentdirectory/$http_code/$filename"
}

# Function to replace "{{endpoint}}" placeholder with value from .endpoint file
replace_endpoint() {
    local file="$1"
    value=$(cat "$file")

    # Check if {{endpoint}} exists in the file content
    if [[ $value == *'{{endpoint}}'* ]]; then
        modified_value="${value/\{\{endpoint\}\}/$endpoint}"
       
        # Store the modified value back into the file
        echo "$modified_value" > "$file"
        touch "$file"
    fi
}

process_tests() {
    local directory=$1
    mkdir -p "$directory/$subdirectory"
    for file in "$directory"/*"$extension"; do
        if [[ -f "$file" ]]; then
            echo " - processing file: $file"
            filename=$(basename -- "$file")

            # Append timestamp to the file name
            timestamp=$(date +"%Y%m%d%H%M%S")
            new_filename="${filename%.*}_${timestamp}.${filename##*.}"

            # Move the file to the processed subdirectory
            mv "$file" "$directory/$subdirectory/$new_filename"
            touch "$directory/$subdirectory/$new_filename"

            replace_endpoint "$directory/$subdirectory/$new_filename"
            execute_curl_command "$directory/$subdirectory/$new_filename" "$directory" "$timestamp"
        fi
    done
}

list_directories() {
    local dir=$1

    echo "started processing..."
    shopt -s nullglob
    for tests_dir in "$dir"/*; do
        if [[ -d "$tests_dir" ]]; then
            process_tests "$tests_dir/valid"
            process_tests "$tests_dir/invalid"
            process_tests "$tests_dir/uncertain"
        fi
    done
    echo "finished!"
}

list_directories "$root_dir"