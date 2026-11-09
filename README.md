# Boboarts

Portfolio and commissions website for Boboarts, a clay sculpture studio.

A plain static site with no build step: open `index.html` in a browser, or host on GitHub Pages, Netlify or Vercel.

## Pages
- `index.html`: hero, filterable gallery with lightbox, studio process videos, commission call to action
- `about.html`: artist story, approach and influences
- `commission.html`: shop-style commission types, process steps and FAQ
- `contact.html`: contact details and an enquiry form (`?commission=<type>` preselects the type)

## Colour options
Four palettes live in `css/style.css` (`kiln`, `terracotta`, `earth`, `sand`). A floating switcher in the bottom-left corner previews them, and `?theme=earth` also works in the URL.

Once one is chosen:
1. Set `data-theme="<choice>"` on `<html>` in each page.
2. Delete the theme switcher block at the top of `js/main.js` and the `.theme-switcher` CSS.

## Placeholders to replace
- Email `hello@boboarts.com` (contact page and the `data-email` on the form)
- WhatsApp number `wa.me/0000000000`
- Instagram links (`href="#"`)
- Prices, which are currently "Price on request"
- Artist name and bio details on the About page

The enquiry form currently opens the visitor's email app. To receive submissions directly, add `action="https://formspree.io/f/<id>" method="POST"` to the form.

## Media
- `assets/works/`: optimised photos (`name.webp` full size, `name-sm.webp` thumbnail)
- `assets/video/`: short muted process clips trimmed from the original videos
