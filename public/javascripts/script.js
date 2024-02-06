class ContactManager {
  #contacts;
  #templates;
  #activeTags;
  #filteredContacts;

  constructor() {
    this.#contacts;
    this.#filteredContacts;
    this.#templates = {};
    this.#activeTags = [];
    this.addEventListeners();
    this.createHandlebarsTemplates();
  }
  //done
  async retrieveContacts() {
    try {
      const response = await fetch("http://localhost:3000/api/contacts");
      this.handleResponse(response, () => {});

      return response;
    } catch (error) {
      console.error("Error retrieving contacts", error);
    }
  }

  async retrieveContact(contactId) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/contacts/${contactId}`
      );

      this.handleResponse(response, () => {});

      return response;
    } catch (error) {
      console.error("Error retrieving a contact", error);
    }
  }
  //done
  createHandlebarsTemplates() {
    const templates = $('[type="text/x-handlebars-template"]');

    for (let i = 0; i < templates.length; i += 1) {
      this.#templates[templates[i].id] = Handlebars.compile(
        $(templates[i]).html()
      );
    }

    templates.remove();
  }
  //done
  async populateContactsGrid() {
    try {
      const response = await this.retrieveContacts();
      const json = await response.json();

      this.#contacts = json;
      this.#filteredContacts = json;
      this.displayContacts();
    } catch (error) {
      console.error("Error populating Contact Grid", error);
    }
  }
  //done
  displayContacts() {
    const $contactsGrid = $("#contacts-grid");
    const $noContacts = $("#no-contacts");

    $contactsGrid.empty();
    if (this.#contacts.length === 0) {
      $noContacts.show();
    } else {
      $noContacts.hide();

      this.convertTagsToArray();

      $contactsGrid.append(this.#templates.contacts(this.#contacts));
    }
  }
  //done
  convertTagsToArray() {
    this.#contacts.forEach((contact) => {
      if (contact.tags !== null) {
        contact.tags = contact.tags.split(",");
      }
    });
  }
  //done
  showNewContactForm() {
    const $newContact = $("#new-contact");

    $("#contact-container").slideUp(650);

    $($newContact).slideDown(650, function () {
      $("#contact-manager").prepend($newContact);
    });
  }
  //done
  hideNewContactForm() {
    const $contactContainer = $("#contact-container");
    const $newContact = $("#new-contact");

    this.clearSearchValue();

    $newContact.slideUp(650);

    $($contactContainer).slideDown(650, () => {
      $($contactContainer).insertBefore($newContact);
      this.resetNewContactForm();
    });
  }
  //done
  resetNewContactForm() {
    const $newContactForm = $("#new-contact");

    $newContactForm.find(".form-group").removeClass("invalid-input");
    $newContactForm.find("form")[0].reset();
    $newContactForm.find("ul").empty();
  }
  //done
  addTagToInputBox(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();

    const tagContent = event.target.value.toLowerCase().trim();
    if (tagContent === "") return;

    if (this.checkDuplicateTags(event, tagContent)) {
      this.handleDuplicateTag(event);
    } else {
      this.createAndAppendTag(event, tagContent);
    }
  }
  //done
  checkDuplicateTags(event, tagContent) {
    const form = $(event.target).closest("form");
    const tagArray = this.extractTagsToArray(form);

    return tagArray.includes(tagContent);
  }
  //done
  handleDuplicateTag(event) {
    const $formGroup = $(event.target).closest(".form-group");
    console.log($formGroup);
    $formGroup.addClass("invalid-input");

    setTimeout(() => {
      $formGroup.removeClass("invalid-input");
    }, 2000);
  }
  //done
  createAndAppendTag(event, tagContent) {
    const tag = $(
      `<li>${tagContent}<button type='button' class="delete-button">X</button></li>`
    );

    $(event.target).prev().append(tag);
    $(event.target).val("");
  }
  //done
  deleteTagInputBox(event) {
    event.preventDefault();
    $(event.target).parent().remove();
  }
  //done
  validateContactForm(event, func) {
    event.preventDefault();

    const form = event.target;
    const $formGroup = $(form).find(".form-group");

    const $emptyInputs = this.findEmptyFormInputs($formGroup);

    $($formGroup).removeClass("invalid-input");

    if ($emptyInputs.length === 0) {
      const tags = this.convertTagsToText(form);
      $(form).find('input[name="tags"').val(tags);

      func(form);
    } else {
      $($emptyInputs).addClass("invalid-input");
    }
  }
  //done
  findEmptyFormInputs($formGroup) {
    return $formGroup.filter(function () {
      const input = $(this).find("input");

      if (input.hasClass("add-tag")) return false;

      return input.val().trim().length === 0;
    });
  }
  //done
  async addContact(form) {
    try {
      const formData = new FormData(form);
      const jsonData = this.convertToJson(formData);

      const headers = {
        "Content-Type": "application/json",
      };
      const fetchOptions = this.getFetchOptions("POST", jsonData, headers);

      const response = await fetch(
        "http://localhost:3000/api/contacts/",
        fetchOptions
      );

      this.handleResponse(response, () => {
        this.hideTagsDropDown();
        this.populateContactsGrid();
        this.hideNewContactForm();
      });
    } catch (error) {
      console.error("Error adding Contact", error);
    }
  }
  //done
  async deleteContact(event) {
    try {
      const contactId = $(event.target)
        .closest(".grid-item")
        .attr("data-contact-id");

      const confirmed = await confirm("Would you like to delete the contact?");

      if (confirmed) {
        const response = await fetch(
          `http://localhost:3000/api/contacts/${contactId}`,
          {
            method: "DELETE",
          }
        );

        this.handleResponse(response, () => {
          this.hideTagsDropDown();
          this.populateContactsGrid();
          this.clearSearchValue();
        });
      }
    } catch (error) {
      console.error("Error deleting contact", error);
    }
  }
  //done
  async editContact(form) {
    try {
      if (!$(form).hasClass("edit-form")) return;

      const formData = new FormData(form);
      const contactId = form.dataset.contactId;

      const jsonData = this.convertToJson(formData, contactId);

      const headers = { "Content-Type": "application/json" };
      const fetchOptions = this.getFetchOptions("PUT", jsonData, headers);

      const response = await fetch(
        `http://localhost:3000/api/contacts/${contactId}`,
        fetchOptions
      );

      this.handleResponse(response, () => {
        this.hideTagsDropDown();
        this.populateContactsGrid();
        this.hideEditContactForm();
      });
    } catch (error) {
      console.error("Error occurred when editing contact", error);
    }
  }
  //done
  async buildEditForm(gridItem) {
    try {
      const contactId = gridItem.attr("data-contact-id");

      const response = await this.retrieveContact(contactId);

      const contactInfo = await response.json();

      if (contactInfo.tags !== null) {
        contactInfo.tags = contactInfo.tags.split(",");
      }

      return this.#templates.editContacts(contactInfo);
    } catch (error) {
      console.error("Error on buildEditForm", error);
    }
  }
  //done
  async createEditFormElement(event) {
    try {
      const gridItem = $(event.target).closest(".grid-item");
      const editForm = await this.buildEditForm(gridItem);
      $("#contact-manager").append(editForm);

      return $("#edit-contact");
    } catch (error) {
      console.error("createEditFormElement Error", error);
    }
  }
  //done
  async showEditContactForm(event) {
    try {
      if (!$(event.target).hasClass("edit")) return;

      const $contactContainer = $("#contact-container");
      const $editFormElement = await this.createEditFormElement(event);

      $contactContainer.slideUp(650);

      $editFormElement.slideDown(650, function () {
        $editFormElement.insertBefore($contactContainer);
      });
    } catch (error) {
      console.error("Error on show Edit Contact Form", error);
    }
  }
  //done
  hideEditContactForm() {
    const $editContact = $("#edit-contact");
    const $contactContainer = $("#contact-container");

    this.clearSearchValue();

    $($editContact).slideUp(650);
    $($contactContainer).slideDown(650, function () {
      $editContact.remove();
    });
  }
  //done
  clearSearchValue() {
    $("#search").val("");
    $("#contacts-filtered").css("display", "none");
    $("#contacts-filtered strong").text("");
  }
  //done
  filterContacts(event) {
    const input = event.target.value;

    if (input.length === 0) {
      this.showAllFilteredContacts();
    } else {
      this.filterContactElements(input);
    }

    this.displayFilteredMessage(input);
  }
  //done
  showAllFilteredContacts() {
    this.#filteredContacts.forEach((contact) => {
      const element = $("#contacts-grid").find(
        `[data-contact-id=${contact.id}]`
      );

      element.show();
    });
    // $("#contacts-grid").children().show();
  }
  //done
  filterContactElements(input) {
    const $contactElements = $("#contacts-grid");

    this.#filteredContacts.forEach((contact) =>
      this.filterElement($contactElements, input, contact)
    );
  }
  //done
  filterElement(contactElements, input, contact) {
    const element = contactElements.find(`[data-contact-id=${contact.id}]`);
    const fullName = contact.full_name.toLowerCase().trim();

    if (fullName.includes(input.toLowerCase())) {
      element.show();
    } else {
      element.hide();
    }
  }
  //done
  displayFilteredMessage(input) {
    const $contactsFiltered = $("#contacts-filtered");
    const strong = $("#contacts-filtered strong");

    if ($(".grid-item:visible").length === 0) {
      $contactsFiltered.show();
      strong.text(input);
    } else {
      $contactsFiltered.hide();
      strong.text("");
    }
  }
  //done
  filterTags(event) {
    const tagName = event.target.dataset.tagName.toLowerCase();

    this.handleTagToggle(tagName);

    if (this.noTagsSelected()) {
      this.showAllContacts();
      this.hideTagsDropDown();
    } else {
      this.updateContactsDisplay();
    }

    $("#search").trigger("input");
  }
  //done
  handleTagToggle(tagName) {
    const $tagElements = $(`[data-tag-name="${tagName}"]`);
    this.updateTagNamesArray(tagName);

    $tagElements.toggleClass("active");
  }
  updateTagNamesArray(tagName) {
    if (this.#activeTags.includes(tagName)) {
      const ind = this.#activeTags.findIndex((tag) => tag === tagName);
      this.#activeTags.splice(ind, 1);
    } else {
      this.#activeTags.push(tagName);
    }
  }
  //done
  noTagsSelected() {
    return this.#activeTags.length === 0;
  }

  showAllContacts() {
    this.#filteredContacts = this.#contacts;
    $("#contacts-grid").show();
  }

  hideTagsDropDown() {
    $("#tags-filtered").slideUp(300),
      function () {
        $("#tags-filtered ul").empty();
      };
  }

  updateContactsDisplay() {
    this.#filteredContacts = this.#contacts.filter(
      this.filterContactsByTag.bind(this)
    );
    const template = this.#templates.createTags(this.#activeTags);
    this.showTagsDropDown(template);
  }

  showTagsDropDown(template) {
    $("#tags-filtered ul").empty();
    $("#tags-filtered ul").append(template);
    $("#tags-filtered").slideDown(300);
  }
  //done
  filterContactsByTag(contact) {
    const element = $("#contacts-grid").find(`[data-contact-id=${contact.id}]`);
    if (contact.tags === null || !this.contactHaveTags(contact)) {
      element.hide();
      return false;
    } else {
      element.show();
      return true;
    }
  }
  //done
  contactHaveTags(contact) {
    return this.#activeTags.every((tag) => contact.tags.includes(tag));
  }
  //done
  handleResponse(response, onSuccess) {
    if (response.ok) {
      onSuccess();
    } else {
      throw new Error(response.statusText);
    }
  }
  //done
  convertToJson(formData, contactId) {
    if (!contactId) formData.append("id", contactId);
    const object = {};

    formData.forEach(function (value, key) {
      if (key === "tags" && value === "") {
        object[key] = null;
      } else {
        object[key] = value.trim();
      }
    });

    const json = JSON.stringify(object);
    return json;
  }
  //done
  extractTagsToArray(form) {
    const tagsTextNodes = $(form)
      .find("li")
      .contents()
      .filter(function () {
        return this.nodeType === 3;
      });

    const tags = tagsTextNodes
      .map(function () {
        return this.nodeValue;
      })
      .get();

    return tags;
  }
  //done
  checkTagDuplicates(tags) {
    return new Set(tags).size !== tags.length;
  }
  //done
  convertTagsToText(form) {
    const tags = this.extractTagsToArray(form);
    return tags.join(",");
  }
  //done
  getFetchOptions(method, body, headers) {
    return {
      method: method,
      headers: headers,
      body: body,
    };
  }
  //done
  addEventListeners() {
    this.newContactEventListeners();
    this.deleteContactEventManagers();
    this.editContactEventListeners();
    this.filterEventListeners();
    this.formEventListeners();
  }

  filterEventListeners() {
    $("#search").on("input", this.filterContacts.bind(this));

    $("#contact-container").on(
      "click",
      ".button-tag",
      this.filterTags.bind(this)
    );
  }

  formEventListeners() {
    $("#contact-manager").on(
      "keydown",
      "input.add-tag",
      this.addTagToInputBox.bind(this)
    );

    $("#contact-manager").on(
      "click",
      "button.delete-button",
      this.deleteTagInputBox.bind(this)
    );

    $("#contact-manager").on("keydown", "input.add-tag", (event) => {
      const allowedKeys = /[a-zA-Z0-9]/g;
      const pressedKey = event.key;

      if (!allowedKeys.test(pressedKey)) {
        event.preventDefault();
      }
    });
  }
  //done
  newContactEventListeners() {
    const addContact = this.addContact.bind(this);

    $("#contact-container").on("click", "button.add", this.showNewContactForm);
    $("#new-contact form").on(
      "click",
      "button.cancel",
      this.hideNewContactForm.bind(this)
    );
    $("#new-contact").on("submit", "form.new-form", (event) => {
      this.validateContactForm.call(this, event, addContact);
    });
  }
  //done
  deleteContactEventManagers() {
    $("#contacts-grid").on(
      "click",
      "button.delete",
      this.deleteContact.bind(this)
    );
  }
  //done
  editContactEventListeners() {
    const editContact = this.editContact.bind(this);

    $("#contacts-grid").on("click", this.showEditContactForm.bind(this));
    $("#contact-manager").on("submit", "form.edit-form", (event) => {
      this.validateContactForm.call(this, event, editContact);
    });
    $("#contact-manager").on(
      "click",
      "button.cancel-edit",
      this.hideEditContactForm.bind(this)
    );
  }
}
