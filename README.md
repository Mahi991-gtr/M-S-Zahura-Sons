# M/S Zahura & Son's — website

A fast, fully static website (plain HTML, CSS and JavaScript — no build step, no server, no framework) for M/S Zahura & Son's, Govt. Contractor & Supplier. It runs on **GitHub Pages for free**.

## What's interactive
- Hero entrance, slow photo zoom and scroll parallax; content that reveals as you scroll; counting-up numbers
- Sticky navigation that hides when scrolling down and returns when scrolling up; scroll-progress bar; back-to-top button
- Scrolling client ticker on the home page; hover effects on cards, buttons and photos
- Project filter chips (and deep links such as `projects.html#shasha-denims`); home-page project cards link to their project
- Photo viewer with next/previous, arrow keys, swipe on phones and a counter (projects, certificates, work orders)
- Contact form with live validation and a spam trap
- Respects "reduce motion" settings; nothing is hidden if JavaScript fails

## Publish on GitHub (free)
1. Create a **public** repository on github.com (e.g. `zahura-and-sons`). Upload everything in this folder (drag and drop works: **Add file > Upload files**), or from a terminal:
   ```
   git init && git add . && git commit -m "Website"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/zahura-and-sons.git
   git push -u origin main
   ```
2. Open **Settings > Pages**. Under *Build and deployment*, set **Source: Deploy from a branch**, **Branch: main**, folder **/ (root)**, then **Save**.
3. After about a minute your site is live at `https://YOUR-USERNAME.github.io/zahura-and-sons/`.
   (To use `https://YOUR-USERNAME.github.io/` instead, name the repository `YOUR-USERNAME.github.io`. A custom domain can be added in the same Pages settings.)

## Make the contact form deliver email
Edit **`js/config.js`** (it has instructions inside):
- `WEB3FORMS_KEY`: get a free key at https://web3forms.com (enter the email that should receive enquiries). Messages then arrive in that inbox, with no server. The key is meant to be public.
- `EMAIL` and `PHONE`: shown on the Contact page (hidden while empty). If there is no Web3Forms key, the form opens the visitor's email app with the message pre-filled, addressed to `EMAIL`.

## Editing
- Text: edit the `.html` files. Photos: put them in `images/` and reference them in the page.
- Colours, fonts and animation: `css/styles.css` (the "Motion" and "Interactive additions" sections at the bottom).
- Behaviour: `js/main.js` (menu, nav, gallery, filter, form) and `js/animate.js` (scroll animations).
- To preview locally, open `index.html` in a browser, or run `python3 -m http.server` in this folder.

Photos and documents belong to M/S Zahura & Son's.
