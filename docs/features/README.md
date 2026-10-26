# Features — what minty-www does and where each part lives

`minty-www` is Daily Minty's public marketing site (www.dailyminty.com): the landing page,
pricing, the learning guides, the FAQ, the Xero integration page and a contact form. It has no
backend of its own; the only server code is the contact endpoint. Written for someone new to
the codebase. The repo's `README.md` covers running it.

| Feature | Document |
|---|---|
| The site as a whole: the stack, the pages and their metadata, links in and out (and the Log In address held until November), the pricing catalogue, money, CTAs, icons, the responsive and accessibility rules it is held to, and its tests | [site.md](site.md) |
| The contact form: the UI, the shared validation rules, the API and its envelope, the mail transport (Microsoft Graph), the bot defences, and what is still open | [../contact-form-implementation.md](../contact-form-implementation.md) |
