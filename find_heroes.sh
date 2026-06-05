for file in src/pages/*/*.jsx; do
    echo "--- $file ---"
    grep -A 15 -B 2 "headingImg" "$file" | grep -v "import"
done
