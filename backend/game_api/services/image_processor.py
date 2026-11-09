import io
from PIL import Image, ImageOps, ImageEnhance

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
OUTPUT_DIMENSION = 512

def validate_image_file(uploaded_file):
    """Validate image format and file size."""
    if uploaded_file.size > MAX_FILE_SIZE:
        raise ValueError("Image file exceeds the 10MB limit.")

    ext = uploaded_file.name.split('.')[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported image format: .{ext}. Allowed formats: JPG, PNG, WEBP.")

    try:
        img = Image.open(uploaded_file)
        img.verify()
        uploaded_file.seek(0)
    except Exception as e:
        raise ValueError("Invalid or corrupted image file.") from e

    return True

def preprocess_and_crop(image_file, rotation=0, brightness=0, contrast=0, saturation=0):
    """
    Crops image to a centered square, resizes to 512x512, applies rotation and color tweaks.
    """
    img = Image.open(image_file)
    img = ImageOps.exif_transpose(img)

    if img.mode != 'RGB':
        img = img.convert('RGB')

    # Apply manual rotation
    if rotation:
        img = img.rotate(-rotation, expand=True)

    # Center crop to square
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    right = left + min_dim
    bottom = top + min_dim
    img = img.crop((left, top, right, bottom))

    # Resize to standard texture dimensions
    img = img.resize((OUTPUT_DIMENSION, OUTPUT_DIMENSION), Image.Resampling.LANCZOS)

    # Brightness adjustment (-50 to +50 -> 0.5 to 1.5 factor)
    if brightness != 0:
        factor = 1.0 + (brightness / 100.0)
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(factor)

    # Contrast adjustment
    if contrast != 0:
        factor = 1.0 + (contrast / 100.0)
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(factor)

    # Saturation adjustment
    if saturation != 0:
        factor = 1.0 + (saturation / 100.0)
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(factor)

    return img
