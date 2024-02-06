# JS239 Sample Project: Contact Manager

All of the request features should be implemented. I tried my best to recreate the html/css of the original website.
I have been learning html/css and really want to try and recreate it as close as possible I wanted to confirm on the exam, that we won't have to have nearly as pretty css.

I also wanted to touch on the functionally of the website.

**Features:**

- **Tag Filtering:**

  - Click a tag on a contact's page to filter by that tag. _(Multiple selection possible)_
  - Click a filtered tag again to remove the filter.
  - Dropdown displays currently selected tags for easy removal.
  - Adding/editing/deleting contacts clears tag filters.

- **Search:**

  - Searches only displayed contacts
    - If contacts are filtered by certain tags, it will only search contacts with those tags. The contacts that are displayed on the screen.
  - Adding/editing/deleting contacts clears search results.
  - The original application searches the full name to see if it the search value is included. I made my search consistent with this, and modified the search text

- **Adding/Removing Tags:**
  - Add tags by typing and pressing enter on the contact Add/Edit page.
  - Remove tags by clicking the "X" next to them.
  - Changes saved only on submit.
  - Tag input limited to alphanumeric characters (a-z, 0-9).
  - No duplicate tags allowed.
  - Basic form validation prevents copy-pasting.
- **Error Page**
  - I added a custom error page, that will show if code within a try/catch block encounters an error.
