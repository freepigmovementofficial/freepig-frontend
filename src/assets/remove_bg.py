from PIL import Image

def remove_background(filename):
    img = Image.open(filename)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    # Using a simple distance check
    # The gray is around 37, 37, 37. We will use a tolerance.
    for item in datas:
        if abs(item[0] - 37) < 20 and abs(item[1] - 37) < 20 and abs(item[2] - 37) < 20:
            newData.append((255, 255, 255, 0)) # transparent
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(filename, "PNG")
    print(f"Processed {filename}")

for f in ["smallWave.png", "mediumWave.png", "bigWave.png"]:
    try:
        remove_background(f)
    except Exception as e:
        print(f"Failed {f}: {e}")
