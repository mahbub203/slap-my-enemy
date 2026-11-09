import io
import math
from PIL import Image, ImageFilter, ImageOps, ImageDraw

def generate_mock_character(img: Image.Image, style: str) -> io.BytesIO:
    """
    Transforms input portrait into a fictional game avatar texture using algorithmic filters.
    """
    img = img.convert('RGB')
    size = img.size[0]

    if style == 'cartoon-3d':
        # Smooth cartoon posterization + warm vibrant tint
        smoothed = img.filter(ImageFilter.SMOOTH_MORE)
        posterized = ImageOps.posterize(smoothed, 4)
        # Soft warm glow overlay
        tint = Image.new('RGB', (size, size), (255, 230, 240))
        result = Image.blend(posterized, tint, 0.12)

    elif style == 'caricature':
        # Bulge center distortion (comedic magnification)
        result = apply_bulge_distortion(img, strength=1.5, radius_ratio=0.48)
        # Boost contrast and saturation
        result = ImageOps.autocontrast(result, cutoff=3)
        # Rosy cheeks accent
        draw = ImageDraw.Draw(result, 'RGBA')
        cx, cy = size // 2, size // 2
        draw.ellipse([cx - 130, cy + 30, cx - 70, cy + 80], fill=(244, 63, 94, 70))
        draw.ellipse([cx + 70, cy + 30, cx + 130, cy + 80], fill=(244, 63, 94, 70))

    elif style == 'pixel-art':
        # Downsample to 48x48 and quantize to 16-color palette
        small = img.resize((48, 48), Image.Resampling.NEAREST)
        quantized = small.quantize(colors=16).convert('RGB')
        result = quantized.resize((size, size), Image.Resampling.NEAREST)

    elif style == 'comic':
        # High contrast ink edges + threshold pop art
        gray = img.convert('L')
        edges = gray.filter(ImageFilter.FIND_EDGES)
        inverted_edges = ImageOps.invert(edges)

        # Posterize color layer
        color_layer = ImageOps.posterize(img, 3)
        # Blend edges with color
        result = Image.blend(color_layer, inverted_edges.convert('RGB'), 0.25)

    elif style == 'low-poly':
        # Mosaic faceted block simulation
        step = 24
        small = img.resize((size // step, size // step), Image.Resampling.BOX)
        quantized = small.quantize(colors=24).convert('RGB')
        result = quantized.resize((size, size), Image.Resampling.NEAREST)
        # Apply sharpen filter to accentuate facets
        result = result.filter(ImageFilter.SHARPEN)

    else:
        result = img

    # Add game avatar border
    draw = ImageDraw.Draw(result)
    draw.rectangle([0, 0, size - 1, size - 1], outline=(168, 85, 247), width=10)

    # Save to BytesIO
    output = io.BytesIO()
    result.save(output, format='PNG')
    output.seek(0)
    return output


def apply_bulge_distortion(img: Image.Image, strength: float = 1.5, radius_ratio: float = 0.5) -> Image.Image:
    """
    Applies a center fish-eye / bulge caricature distortion to an image.
    """
    w, h = img.size
    cx, cy = w / 2, h / 2
    max_radius = min(w, h) * radius_ratio

    src_pixels = img.load()
    out = Image.new('RGB', (w, h))
    dst_pixels = out.load()

    for y in range(h):
        for x in range(w):
            dx = x - cx
            dy = y - cy
            dist = math.sqrt(dx * dx + dy * dy)

            if dist < max_radius and dist > 0:
                factor = math.pow(dist / max_radius, strength)
                src_x = int(cx + dx * factor)
                src_y = int(cy + dy * factor)

                src_x = max(0, min(w - 1, src_x))
                src_y = max(0, min(h - 1, src_y))
                dst_pixels[x, y] = src_pixels[src_x, src_y]
            else:
                dst_pixels[x, y] = src_pixels[x, y]

    return out
