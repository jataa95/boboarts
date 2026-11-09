# Boboarts

Portfolio and commissions website for Boboarts, a clay sculpture studio.

A plain static site with no build step: open `index.html` in a browser, or deploy to Vercel (`vercel.json` gives clean URLs such as `/about`).

## Design
The layout follows draxton.webflow.io: a split logo, a "Contact" pill and a round menu button that opens a full-screen menu, uppercase headings with italic serif accents, floating tilted artwork in the hero, and a giant wordmark in the footer.

The palette is Sand: a light clay background, mild black type and a clay-brown accent, with an animated film-grain overlay. Colours live at the top of `css/style.css`. The grain is the `body::after` rule; lower its `opacity` to make it subtler.

## Pages
- `index.html`: hero with floating works, a paragraph that lights up as you scroll, the studio's areas of work, an artwork slider, an artist feature, process steps, commission rows and an info strip
- `gallery.html`: every work in a grid with filters (`gallery.html#animals` opens a filter)
- `work.html?p=<slug>`: a page for one piece, with a commission button and a link to the next work
- `about.html`: story, mission, numbers and studio videos
- `commission.html`: commission types, how it works and FAQ
- `contact.html`: contact details and an enquiry form (`?commission=<type>` preselects the type)

## Adding or editing works
All works are listed in `js/works.js`. Add an entry there, with images in `assets/works/` (`name.webp` and `name-sm.webp`) or a clip in `assets/video/` (`name.mp4` and `name.jpg` poster). It then appears in the gallery, the home slider, the footer image strip and its own work page.

## Placeholders to replace
- Email `hello@boboarts.com` (pages and the form's `data-email`)
- WhatsApp `wa.me/0000000000`
- Instagram links (`href="#"`)
- Prices, currently "Price on request"

The enquiry form opens the visitor's email app. To receive submissions directly, add `action="https://formspree.io/f/<id>" method="POST"` to the form in `contact.html`.
