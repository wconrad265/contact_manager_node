Contact Manager:

- No contacts
  - need to display a grey box, saying there are no contacts.
  - Then a button to add contacts
- Add contacts
  - have a form element
  - following required fields
    - full_name
    - email
    - phone_number
    - tags
  - post request http://localhost:3000/api/contacts/
  - succuss is 201,
  - need to display the homepage with all the contacts, and new contact added
- displaying Contacts

  - use handelbar js template
  - use custom attribute to reference contact id returned by server
  - use current .grid-item class as template
  -

- Add Tag
  - When a user creates/edit a contact, we have a field called tags
  - the user can type in a tag, and presses enter
  - we grab the tag and add it to a ul list
    - like in this link. https://www.geeksforgeeks.org how-to-create-tags-input-box-in-html-css-and-javascript/
    - When the user clicks edit/add, we connate the ul list together, seperated by commas.
- Filter by tags

  - below add contacts, we have another div
  - when we retrieve all the contacts, we will search all the tag fields
  - we will then put the tag fields in a ul list
  - the user will be able to click the ul list to filter the contacts by tags

- Search contacts

  - the search box is only searching by first name
  - if no contacts match, then we display a div
    - the div says that there are no contacts starting with search box value
    - div will appear below the contacts grid
  - we then filter the contacts that appear depending if they start with the value in the input field

- edit contact

  - will use handlebar.js edit-contact template
  - When user clicks edit contact
  - populate edit-contact template with their information
  - set value of correct fields
  - set value of tags
  - when user clicks submit, send put request to the server
  - issue a new get request, and replace the storage array with this new get request array

- delete contact
  - issue alert box
  - if user clicks accept, then we send a delete request
  - reassign the contacts array to a new get request

Steps

To-do list

- Add tag input functionally to edit form (done)
  - add tag input field (done)
  - delegate event listener from new contact to edit form (done)
  - get tags from edit list (done)
    - retrive contact info form server\
    - use handlebars template to populate this
- Filter tags (done)
  - When user clicks tag on screen
    - turn tag to purple (done)
    - filter all other contacts that don't contain that tag (done)
  - provide functionally if multiple tags are clicked (done)
    - only users who have all the tags (done)
  - display drop down, showing tags that are clicked.
- Filter and Search (done)
  - when user clicks tag
  - create variable filteredTagConctacts
  - This is array that search will search through
  - priority of seraching tags > search
- recheck all event listeners (done)

- Tag Input
  - only allow characters numbers
    - replace all multi spaces with one space
  - validate that there are no duplicates
    - when user hits enter, check to see if entered value is already included in tags
