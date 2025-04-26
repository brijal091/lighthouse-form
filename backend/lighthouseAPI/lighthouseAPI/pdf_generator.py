import asyncio
from playwright.async_api import async_playwright

async def generate_pdf_from_html(html_path: str, pdf_path: str):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Open local file path
        file_url = f'file:///{html_path.replace("\\", "/")}'  # make URL-friendly
        await page.goto(file_url, wait_until='networkidle')

        await asyncio.sleep(2)

        # Expand content
        await page.evaluate("""document.querySelectorAll('.lh-chevron-container').forEach(el => el.click());""")
        await asyncio.sleep(1)
        await page.evaluate("""document.querySelectorAll('.lh-clump-toggletext--show').forEach(el => el.click());""")
        await asyncio.sleep(1)

        # Hide UI clutter
        await page.evaluate("""
            const classesToHide = ['lh-footer', 'lh-topbar'];
            classesToHide.forEach(className => {
                document.querySelectorAll('.' + className).forEach(el => {
                    el.style.display = 'none';
                });
            });
            document.querySelectorAll('a').forEach(el => {
                el.removeAttribute('href');
                el.style.pointerEvents = 'none';
                el.style.textDecoration = 'none';
                el.style.color = 'inherit';
            });
        """)

        await page.pdf(path=pdf_path, format='A4')
        await browser.close()

def generate_pdf(html_path: str, pdf_path: str):
    asyncio.run(generate_pdf_from_html(html_path, pdf_path))
