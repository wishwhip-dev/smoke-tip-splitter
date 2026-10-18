# The WishWhip footer

Every page ends with one small line, "Made with WishWhip · Report", from
`components/attribution.tsx`. In an app made from this template, `app/layout.tsx` already renders
`<Attribution />` under the page; there is nothing to call and nothing to add. An app made before
the footer existed does not: mount it there, after the page, when this project's briefing says so.

"Made with WishWhip" links to WishWhip. "Report" opens WishWhip's report page for this app, so a
visitor who finds something wrong with it can say so. The footer sits in the normal flow of the
page, after everything else, and never covers the app.

## Rules

- **Keep it.** Do not edit, move, restyle or remove `Attribution`, and keep `<Attribution />` in
  `app/layout.tsx`, after the page.
- **Do not hide it**: no CSS, overflow, fixed or full-height element that covers it or pushes it
  out of reach. A page may fill the screen; the footer comes after it.
- **Do not add a second WishWhip mark**, link or credit anywhere else.
- WishWhip sets `NEXT_PUBLIC_WISHWHIP_URL` on the app's deployment, and the footer renders nothing
  without it: in the workspace and in a local run there is no footer, and that is expected. Do not
  set the variable or give it a fallback.
- WishWhip also sets `NEXT_PUBLIC_WISHWHIP_BADGE` from the owner's plan: `hidden` shows only
  "Report". Do not set it either; the footer reads it as it is.
