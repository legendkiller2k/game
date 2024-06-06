class Modal {
    constructor(contentUrl, buttons) {
        this.contentUrl = contentUrl;
        this.buttons = buttons;
        this.modalBackground = null;
        this.buttons = [];
        this.#buildModal();
    }

    async #buildModal() {
        // Create the modal background
        this.modalBackground = document.createElement('div');
        this.modalBackground.classList.add('modal-background');
        this.modalBackground.style.display = 'none';

        // Create the modal element
        this.modalElement = document.createElement('div');
        this.modalElement.classList.add('modal-window');

        // Load the modal template
        const templateResponse = await fetch('/pages/modals/modal.html');
        const templateContent = await templateResponse.text();

        // Load the content from the HTML file
        const response = await fetch("/pages/modals/" + this.contentUrl + ".html");
        const content = await response.text();

        // Set the content of the modal
        this.modalElement.innerHTML = templateContent;
        this.modalElement.querySelector('#modal-window-content').innerHTML = content;

        // Generate tabs
        const tabcontainer = this.modalElement.querySelector('#modal-tabs');
        const tabs = this.modalElement.querySelectorAll('[name="modalTab"]');
        let firstTab = true;
        tabs.forEach((tab) => {
            let newTab = document.createElement('div');
            newTab.id = 'tab-' + tab.id;
            newTab.classList.add('modal-tab-button');
            newTab.setAttribute('data-tabid', tab.id);
            newTab.innerHTML = tab.getAttribute('data-tabname');
            newTab.addEventListener('click', () => {
                tabs.forEach((tab) => {
                    if (tab.getAttribute('id') !== newTab.getAttribute('data-tabid')) {
                        tab.style.display = 'none';
                        tabcontainer.querySelector('[data-tabid="' + tab.id + '"]').classList.remove('model-tab-button-selected');
                    } else {
                        tab.style.display = 'block';
                        tabcontainer.querySelector('[data-tabid="' + tab.id + '"]').classList.add('model-tab-button-selected');
                    }
                });
            });
            if (firstTab) {
                newTab.classList.add('model-tab-button-selected');
                tab.style.display = 'block';
                firstTab = false;
            } else {
                tab.style.display = 'none';
            }
            tabcontainer.appendChild(newTab);
        });

        // add the window to the modal background
        this.modalBackground.appendChild(this.modalElement);

        // Append the modal element to the document body
        document.body.appendChild(this.modalBackground);

        // Add event listener to close the modal when the close button is clicked
        this.modalElement.querySelector('#modal-close-button').addEventListener('click', () => {
            this.close();
        });

        // Add event listener to close the modal when clicked outside
        this.modalBackground.addEventListener('click', (event) => {
            if (event.target === this.modalBackground) {
                this.close();
            }
        });

        // Add event listener to close the modal when the escape key is pressed
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.close();
            }
        });
    }

    async open() {
        // hide the scroll bar for the page
        document.body.style.overflow = 'hidden';

        // buttons
        const buttonContainer = this.modalElement.querySelector('#modal-footer');
        if (this.buttons.length > 0) {
            this.buttons.forEach((button) => {
                buttonContainer.appendChild(button.render());
            });
        } else {
            const closeButton = document.createElement('button');
            closeButton.classList.add('modal-button');
            closeButton.innerHTML = 'OK';
            closeButton.addEventListener('click', () => {
                this.close();
            });
            buttonContainer.appendChild(closeButton);
        }

        // show the modal
        this.modalBackground.style.display = 'block';
    }

    close() {
        // Remove the modal element from the document body
        if (this.modalBackground) {
            this.modalBackground.remove();
            this.modalBackground = null;
        }

        // Show the scroll bar for the page
        if (document.getElementsByClassName('modal-window-body').length === 0) {
            document.body.style.overflow = 'auto';
        }
    }

    addButton(button) {
        this.buttons.push(button);
    }

    removeTab(tabId) {
        const tab = this.modalElement.querySelector('#tab-' + tabId);
        if (tab) {
            tab.style.display = 'none';
        }
    }
}

class ModalButton {
    constructor(text, isRed, callingObject, callback) {
        this.text = text;
        this.isRed = isRed;
        this.callingObject = callingObject;
        this.callback = callback;
    }

    render() {
        const button = document.createElement('button');
        button.classList.add('modal-button');
        if (this.isRed) {
            button.classList.add('redbutton');
        }
        button.innerHTML = this.text;
        let callback = this.callback;
        let callingObject = this.callingObject;
        button.addEventListener('click', function () {
            callback(callingObject);
        });
        return button;
    }
}