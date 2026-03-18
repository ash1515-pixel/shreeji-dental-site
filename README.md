# Dr. Rohit Jakhar Website

Production project (Vercel): `shreeji-dental-site`

## Live URL

- https://shreeji-dental-site.vercel.app

## Doctor Photo (WhatsApp wali)

Put doctor image at:

`assets/images/dr-rohit-photo.jpg`

The hero section auto-shows placeholder if file is missing.

## Quick Content Update

- Services placeholders: section `#services`
- Gallery placeholders: section `#gallery`
- Videos links: section `#videos` (replace YouTube links)
- Reviews form: section `#reviews` (FormSubmit email target)
- Appointment WhatsApp form: section `#appointment`

## Domain Setup (already added in Vercel)

Added domains:
- `drrohitjakhar.com`
- `www.drrohitjakhar.com`

Now set DNS at your domain provider:

- `A` record for `@` -> `76.76.21.21`
- `A` record for `www` -> `76.76.21.21`

After DNS propagation, Vercel will verify automatically.

## Deploy updates

```bash
cd /Users/ashishlamrod/Documents/shreeji-dental-site
vercel --prod
```
