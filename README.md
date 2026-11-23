# Trixia Anne Reyes — Portfolio

A static, single-page portfolio site (plain HTML/CSS/JS, no build step).

```
index.html            page content
styles.css            design (purple palette tokens at the top of the file)
script.js             intro, scroll reveals, typing headline, counters, filters, lightbox, regional LinkedIn link
assets/img/           web-sized photos (resized from Contents/)
assets/docs/          the two downloadable one-page resumes (PDF)
resume-src/           HTML sources for those PDFs (+ bundled fonts)
```

`Contents/` and `Resume/` hold the original files and are excluded by `.gitignore`, so they are never published.

## Preview locally

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765.

## Editing

- **Text**: edit `index.html`. Each section is marked with a comment (`<!-- HERO -->`, `<!-- EXPERIENCE -->`, …).
- **Typing headline roles**: the `roles` array in `script.js`.
- **Counters**: the `data-count` attributes in the `STATS BAND` section of `index.html`.
- **Photos**: add a resized JPG to `assets/img/` and copy one `<figure class="ph">` block in the gallery. Use `data-cat` = `travel`, `diving`, `climbing` or `running`; add `ph--tall` for portrait shots.
- **Colors**: the `:root` variables at the top of `styles.css`.

## Regenerating the resume PDFs

Edit `resume-src/academic.html` or `resume-src/ld-hr.html`, start the local server, then run:

```bash
for p in "academic:Trixia_Reyes_Academic_CV" "ld-hr:Trixia_Reyes_LD_HR_Resume"; do
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer \
    --virtual-time-budget=10000 --print-to-pdf="assets/docs/${p##*:}.pdf" "http://localhost:8765/resume-src/${p%%:*}.html"
done
```

Both resumes are written for applicant tracking systems (ATS): single column, real text (no text in images), standard section headings, no tables, and no headers or footers (an ATS reads those before the name). The Academic CV is 3 pages; the L&D/HR resume must stay at 1 page. After editing, check the page count:

```bash
python3 -c "from pypdf import PdfReader as R; [print(f, len(R(f).pages)) for f in ['assets/docs/Trixia_Reyes_Academic_CV.pdf','assets/docs/Trixia_Reyes_LD_HR_Resume.pdf']]"
```

## Hosting at trixia-reyes.github.io

The site is served by the repository `trixia-reyes/trixia-reyes.github.io`, owned by the GitHub organization `trixia-reyes` (which `sur-akash` owns). Any push to `main` republishes it within a minute or two.

## Regional LinkedIn link

`script.js` maps the visitor's time zone to LinkedIn's country subdomain (`ph.`, `sg.`, `th.`, `vn.`, `hk.`, plus `my.`, `id.`, `in.`). Everyone else gets `www.linkedin.com`. All of them open the same profile.
