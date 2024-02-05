class ContactManager {
  #contacts;
  #templates;

  constructor() {
    this.#contacts;
    this.#templates = {};
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
  }
  //done
  validateContactForm(event, func) {
    event.preventDefault();

    const form = event.target;
    const $formGroup = $(form).find(".form-group");

    const $emptyInputs = this.findEmptyFormInputs($formGroup);

    $($formGroup).removeClass("invalid-input");

    if ($emptyInputs.length === 0) {
      func(form);
    } else {
      $($emptyInputs).addClass("invalid-input");
    }
  }
  //done
  findEmptyFormInputs($formGroup) {
    return $formGroup.filter(function () {
      const input = $(this).find("input");

      if (input.attr("id") === "new-tags") return false;

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
        this.populateContactsGrid();
        this.hideNewContactForm();
      });
    } catch (error) {
      console.log("Error adding Contact", error);
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

        this.handleResponse(response, this.populateContactsGrid.bind(this));
      }
    } catch (error) {
      console.error("Error deleting contact", error);
    }
  }
  //done
  async editContact(form) {
    try {
      if (!$(event.target).hasClass("edit-form")) return;

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
        this.populateContactsGrid();
        this.hideEditContactForm();
      });
    } catch (error) {
      console.error("Error occurred when editing contact", error);
    }
  }
  //done
  buildEditForm(gridItem) {
    const contactId = gridItem.attr("data-contact-id");
    const contactInfo = gridItem.find("[data-field]");

    const contactObj = {};
    contactObj["id"] = contactId;

    for (let i = 0; i < contactInfo.length; i += 1) {
      const key = contactInfo[i].dataset.field;
      const value = contactInfo[i].textContent.trim();
      contactObj[key] = value;
    }

    return this.#templates.editContacts(contactObj);
  }
  //done
  createEditFormElement(event) {
    const gridItem = $(event.target).closest(".grid-item");
    const editForm = this.buildEditForm(gridItem);

    $("#contact-manager").append(editForm);

    return $("#edit-contact");
  }
  //done
  showEditContactForm(event) {
    if (!$(event.target).hasClass("edit")) return;

    const $contactContainer = $("#contact-container");
    const $editFormElement = this.createEditFormElement(event);

    $contactContainer.slideUp(650);

    $editFormElement.slideDown(650, function () {
      $editFormElement.insertBefore($contactContainer);
    });
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
      this.showAllContacts();
    } else {
      this.filterContactElements(input);
    }

    this.displayFilteredMessage(input);
  }
  //done
  showAllContacts() {
    $("#contacts-grid").children().show();
  }
  //done
  filterContactElements(input) {
    const $contactElements = $("#contacts-grid");

    this.#contacts.forEach((contact) =>
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
      console.log(key);
      if (key === "tags" && value === "") {
        object[key] === null;
      } else {
        object[key] = value.trim();
      }
    });

    const json = JSON.stringify(object);

    return json;
  }
  //done
  getFetchOptions(method, body, headers) {
    return {
      method: method,
      headers: headers,
      body: body,
    };
  }

  addEventListeners() {
    this.newContactEventListeners();
    this.deleteContactEventManagers();
    this.editContactEventListeners();

    $("#search").on("input", this.filterContacts.bind(this));
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
    $("#new-contact form").on("submit", (event) => {
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
    $("#contact-manager").on("submit", (event) => {
      this.validateContactForm.call(this, event, editContact);
    });
    $("#contact-manager").on(
      "click",
      "button.cancel-edit",
      this.hideEditContactForm.bind(this)
    );
  }
}
