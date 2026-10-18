# Plan

Goal: SMOKE tip splitter: enter the bill amount, the tip percentage and how many people, and see what everyone owes, rounded to the cent.

1. The home page at the root URL shows the calculator as a form with labelled inputs for the bill amount, the tip percentage and the number of people, plus a submit button labelled 'Calculate' — it works with no sign-in, no URL parameter and no prior navigation.
2. The tip percentage can be set either by tapping one of six preset buttons (10%, 12.5%, 15%, 18%, 20%, 25%), where the chosen preset stays visually highlighted, or by typing a custom percentage such as 17.5 into the percentage input.
3. After Calculate, the page shows three figures: the tip amount, the total including tip, and each person's share — all in the chosen currency and always displayed to exactly two decimal places (e.g. £12.35, never £12.3). Changing any input afterwards updates the figures immediately without pressing Calculate again.
4. Each person's share is listed separately (Person 1, Person 2, and so on); when the total does not divide evenly, the extra penny or pennies are shown on named people so the listed shares add up exactly to the total with tip — e.g. a £100.00 bill at 15% among 3 people lists £38.33, £38.33 and £38.34, and a headcount of 1 lists one person paying the whole total.
5. Entering a bill of zero or less, a percentage below 0, a headcount of zero or less, or leaving an input empty shows a clear error message on the page instead of a result; a bill typed with more than two decimals (e.g. 19.999) is rounded to the nearest cent before calculating rather than erroring.
6. A currency selector offers four symbols ($, £, €, ¥); the chosen symbol is applied to every amount shown on the page, in the result and in the saved history.
7. Pressing 'Save split' stores the bill amount, tip percentage, headcount, currency and the calculated per-person shares in the browser database and shows a confirmation toast; the saved split is still listed after reloading the page.
8. A history section lists the saved splits newest first, showing at least the bill, tip percentage, headcount and total for each, with a Delete button on every entry that removes it from the list immediately; when nothing has been saved yet, the section says so instead of showing an empty list.
9. The current result has a Share button that, when pressed, shares or saves an image of the split summary or copies a summary link, with what happened shown as text next to the button.
10. Large values still calculate correctly and readably: a bill of £9,999.99 or a party of 20 people produces a correct per-person figure, with thousands separators shown on large amounts (e.g. $2,335.00).
11. Every control on the page is reachable and operable from the keyboard, and the whole form-and-result layout stays usable at phone width.
12. The app's name, title and description in app/identity.ts are rewritten to describe the tip splitter, so the browser tab shows the app's real name.

These are the outcomes this task is judged against.