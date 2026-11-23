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

Each page is fixed at A4. If text is added and the page overflows, the bottom gets cut off, so check the PDF after every edit.

## Deploying to GitHub Pages

This folder sits inside a larger repository, so give it its own repo first:

```bash
cd Trixia_site
git init -b main
git add .
git commit -m "Portfolio site"
gh repo create <account>/<repo-name> --public --source=. --push
gh api -X POST repos/<account>/<repo-name>/pages -f "source[branch]=main" -f "source[path]=/"
```

The site goes live at `https://<account>.github.io/<repo-name>/` within a minute or two. If the repo is named `<account>.github.io`, the site is served from the root URL instead. A custom domain can be added later under the repo's Settings → Pages.

## Regional LinkedIn link

`script.js` maps the visitor's time zone to LinkedIn's country subdomain (`ph.`, `sg.`, `th.`, `vn.`, `hk.`, plus `my.`, `id.`, `in.`). Everyone else gets `www.linkedin.com`. All of them open the same profile.
