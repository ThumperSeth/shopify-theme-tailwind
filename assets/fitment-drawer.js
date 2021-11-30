if (!customElements.get('product-fitment')) {
  customElements.define('product-fitment', class ProductFitment extends HTMLElement {
    constructor() {
      super();
	  if(!this.hasAttribute('available')) return;
      this.errorHtml = this.querySelector('template').content.firstElementChild.cloneNode(true);

    }

    fetchAvailability(variantId) {
      const variantSectionUrl = `${this.dataset.baseUrl}variants/${variantId}/?section_id=pickup-availability`;

      fetch(variantSectionUrl)
        .then(response => response.text())
        .then(text => {
          const sectionInnerHTML = new DOMParser()
            .parseFromString(text, 'text/html')
            .querySelector('.shopify-section');
          this.renderPreview(sectionInnerHTML);
        })
        .catch(e => {
          const button = this.querySelector('button');
          if (button) button.removeEventListener('click', this.onClickRefreshList);
          this.renderError();
        });
    }

    onClickRefreshList(evt) {
      this.fetchAvailability(this.dataset.variantId);
    }

    renderError() {
      this.innerHTML = '';
      this.appendChild(this.errorHtml);

      this.querySelector('button').addEventListener('click', this.onClickRefreshList);
    }

    renderPreview(sectionInnerHTML) {
      const drawer = document.querySelector('product-fitment-drawer');
      if (drawer) drawer.remove();
      if (!sectionInnerHTML.querySelector('product-fitment-preview')) {
        this.innerHTML = "";
        return;
      }

      this.innerHTML = sectionInnerHTML.querySelector('product-fitment-preview').outerHTML;
	  this.setAttribute('available', '');

      document.body.appendChild(sectionInnerHTML.querySelector('product-fitment-drawer'));

      this.querySelector('button').addEventListener('click', (evt) => {
        document.querySelector('product-fitment-drawer').show(evt.target);
      });
    }
  });
}

if (!customElements.get('product-fitment-drawer')) {
  customElements.define('product-fitment-drawer', class ProductFitmentDrawer extends HTMLElement {
    constructor() {
      super();

      this.onBodyClick = this.handleBodyClick.bind(this);

      this.querySelector('button').addEventListener('click', () => {
        this.hide();
      });

      this.addEventListener('keyup', () => {
        if(event.code.toUpperCase() === 'ESCAPE') this.hide();
      });
    }

    handleBodyClick(evt) {
      const target = evt.target;
      if (target != this && !target.closest('product-fitment-drawer') && target.id != 'ShowProductFitmentDrawer') {
        this.hide();
      }
    }

    hide() {
      this.removeAttribute('open');
      document.body.removeEventListener('click', this.onBodyClick);
      document.body.classList.remove('overflow-hidden');
      removeTrapFocus(this.focusElement);
    }

    show(focusElement) {
      this.focusElement = focusElement;
      this.setAttribute('open', '');
      document.body.addEventListener('click', this.onBodyClick);
      document.body.classList.add('overflow-hidden');
      trapFocus(this);
    }
  });
}
