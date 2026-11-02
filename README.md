# DenSuu — Portfolio

Static site for GitHub Pages. No build step, no frameworks: just HTML, CSS and JS.

```
index.html                     Home (hero, about, work, expertise, services, process, contact)
assets/css/style.css           All styling (colors at the top under :root)
assets/js/main.js              Stars, nav, scroll reveal, video autoplay, lightbox, tabs
assets/videos/                 Compressed demo clips (mp4)
assets/img/                    Video posters + favicon
```

## Put it online (GitHub Pages)

1. Create a GitHub account if you don't have one.
2. Create a new **public** repository named exactly `YOURUSERNAME.github.io`.
3. In the repo, click **Add file → Upload files** and drag in everything from this folder
   (`index.html`, `assets/`, `README.md`). Commit.
4. Go to **Settings → Pages**. Under "Build and deployment", set Source to
   **Deploy from a branch**, branch **main**, folder **/ (root)**. Save.
5. After a minute or two the site is live at `https://YOURUSERNAME.github.io`.

To change something later, open the file on GitHub, click the pencil icon, edit, and commit.
The site updates automatically.

## Adding a video

Copy any tile block, e.g.:

```html
<a class="tile" href="assets/videos/my-clip.mp4" data-lightbox data-title="Clip title" data-meta="Project">
  <video data-autoplay muted loop playsinline preload="none" poster="assets/img/my-clip.jpg" data-src="assets/videos/my-clip.mp4"></video>
  <div class="tile-cap"><div><span>Category</span><h4>Clip title</h4></div></div>
</a>
```

**YouTube instead of mp4:** add `data-youtube="VIDEO_ID"` to the `<a>` (the part after `watch?v=`).
The tile still uses the `<video>`/poster as its preview; clicking opens the YouTube player.
You can replace the `<video>` with `<img src="https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg" alt="">`.

Keep clips short (5–15 s) and under ~5 MB so the page stays fast. GitHub rejects files over 100 MB.

## Changing the look

Colors are at the top of `assets/css/style.css`:
`--accent` is the lunar-blue highlight; `--bg` is the background.
