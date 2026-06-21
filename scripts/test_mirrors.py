#!/usr/bin/env python3
"""
ebank.ai — Mirror URL Accessibility Test

Tests all mirrorUrl links in the data layer to ensure they are accessible.
Run after adding or updating mirror URLs.

Usage:
    python scripts/test_mirrors.py                     # Quick test
    python scripts/test_mirrors.py --verbose           # Show full URLs
    python scripts/test_mirrors.py --fix               # Auto-fix with ghproxy
"""

import re, sys, time, os, urllib.request, ssl

DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'src', 'lib', 'data.ts')

def extract_mirror_urls(filepath=DATA_FILE):
    with open(filepath) as f:
        content = f.read()
    # Find each skill block's slug and mirrorUrl together
    blocks = re.findall(
        r'slug:\s*"([^"]+)"[\s\S]*?mirrorUrl:\s*"([^"]+)"',
        content
    )
    return blocks  # list of (slug, url) tuples

def test_url(url, timeout=10):
    context = ssl._create_unverified_context()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"})
        resp = urllib.request.urlopen(req, timeout=timeout, context=context)
        return (True, resp.status)
    except urllib.error.HTTPError as e:
        return (False, f"HTTP {e.code}")
    except Exception as e:
        return (False, str(e)[:120])

def fix_url(slug, current_url):
    """Rewrite a URL to use ghproxy.com"""
    gh_match = re.search(r'github\.com/([^"\']+)', current_url)
    if gh_match:
        return f"https://ghproxy.com/https://github.com/{gh_match.group(1)}"
    # Try to extract from data.ts context
    with open(DATA_FILE) as f:
        content = f.read()
    idx = content.find(slug)
    if idx >= 0:
        gh_in_context = re.search(r'github\.com/([^"\'\\s]+)', content[idx:idx+500])
        if gh_in_context:
            return f"https://ghproxy.com/https://github.com/{gh_in_context.group(1)}"
    return None

def main():
    verbose = '--verbose' in sys.argv
    auto_fix = '--fix' in sys.argv
    
    pairs = extract_mirror_urls()
    print(f"Found {len(pairs)} mirror URLs\n")
    if not pairs:
        print("No mirror URLs found.")
        sys.exit(1)
    
    working, broken = [], []
    for slug, url in pairs:
        ok, detail = test_url(url)
        if ok:
            working.append((slug, url))
        else:
            broken.append((slug, url, detail))
        icon = "✓" if ok else "✗"
        status_str = f"[{detail}]" if ok else f"[{detail}]"
        print(f"  {icon} {status_str} {slug}")
        if verbose:
            print(f"      {url}")
        time.sleep(0.3)
    
    print(f"\n{'='*50}")
    print(f"Results: {len(working)} working / {len(broken)} broken / {len(pairs)} total")
    
    if broken:
        print("\nBroken mirrors:")
        for slug, url, detail in broken:
            print(f"  {slug}: {url}")
            print(f"    Error: {detail}")
            if auto_fix:
                new_url = fix_url(slug, url)
                if new_url:
                    with open(DATA_FILE) as f:
                        content = f.read()
                    content = content.replace(url, new_url)
                    with open(DATA_FILE, 'w') as f:
                        f.write(content)
                    print(f"    Fixed -> {new_url}")
                else:
                    print(f"    Could not auto-fix")
        if auto_fix:
            print("\nRe-run to verify fixes.")
        sys.exit(1)
    else:
        print("All mirror URLs are accessible!")
        sys.exit(0)

if __name__ == '__main__':
    main()
