#!/usr/bin/env python3
"""SVG to DST converter using pyembroidery + svgelements"""

import sys
import os

def convert_svg_to_dst(svg_path, dst_path):
    try:
        from pyembroidery import EmbPattern, write_dst, STITCH, JUMP, END
        from svgelements import SVG, Path, Shape
        
        pattern = EmbPattern()
        svg = SVG.parse(svg_path)
        scale = 2.6458333333
        
        for element in svg:
            if isinstance(element, Shape):
                element = Path(element)
            
            if isinstance(element, Path):
                for subpath in element.as_subpaths():
                    subpath = Path(subpath)
                    distance = subpath.length(error=1e7, min_depth=4)
                    segments = max(1, int(distance / 20.0))
                    points = [
                        (int(subpath.point(i / float(segments)).x * scale),
                         int(subpath.point(i / float(segments)).y * scale))
                        for i in range(segments + 1)
                    ]
                    
                    if points:
                        pattern.add_stitch_absolute(JUMP, points[0][0], points[0][1])
                        for point in points[1:]:
                            pattern.add_stitch_absolute(STITCH, point[0], point[1])
        
        pattern.add_stitch_absolute(END, 0, 0)
        write_dst(pattern, dst_path)
        return True
    except ImportError as e:
        print(f"Error: Missing dependency - {e}\nInstall: pip3 install --user pyembroidery svgelements")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 convert-dst-reliable.py <input.svg> <output.dst>")
        sys.exit(1)
    
    svg_path, dst_path = sys.argv[1], sys.argv[2]
    if not os.path.exists(svg_path):
        print(f"Error: File not found: {svg_path}")
        sys.exit(1)
    
    if convert_svg_to_dst(svg_path, dst_path):
        print(f"✓ Converted to: {dst_path}")
        sys.exit(0)
    else:
        sys.exit(1)
