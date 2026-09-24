---
description: Create a flashcard deck on a topic
argument-hint: <topic> <count>
---

Use the `content-author` agent to create a deck of `$2` cards on `$1` under
`packages/content/flashcards/$1/`.

`deck.json` holds the slug, title and topic. Each card is `cards/<slug>.md` with the front and the
back separated by `---`.

Rules for good cards, since these go through FSRS and you will see them for years:

- One fact per card. A card asking two things gets rated by the harder half.
- The front must be answerable without the back visible. "Debounce" is not a front; "What does
  debounce do to a burst of calls?" is.
- No card whose answer is "it depends" without the dependency on the front.
