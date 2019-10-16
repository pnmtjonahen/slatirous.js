(function() {
  const template = document.createElement('template');
  template.innerHTML = `
<style>
#topbutton {
  display: none;
  position: fixed;
  bottom: 20px;
  right: 30px;
  z-index: 99;
  font-size: 18px;
  border: none;
  outline: none;
  background-color: red;
  color: white;
  cursor: pointer;
  padding: 15px;
  border-radius: 4px;
}

#topbutton:hover {
  background-color: #555;
}
</style>
<button id="topbutton" title="Go to top">Top</button>
`;

  class TopButton extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({
        mode: 'open'
      });
      this._shadowRoot.appendChild(template.content.cloneNode(true));
      var topbutton = this._shadowRoot.getElementById('topbutton');

      // When the user clicks on the button, scroll to the top of the document
      this.addEventListener('click', () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      });

      var scrolling = false;
      window.onscroll = () => {
        scrolling = true;
      };

      setInterval(() => {
        if (scrolling) {
          scrolling = false;
          if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            topbutton.style.display = 'block';
          } else {
            topbutton.style.display = 'none';
          }
        }
      }, 250);

      // or for modern browsers
      document.addEventListener('wheel', () => {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
          topbutton.style.display = 'block';
        } else {
          topbutton.style.display = 'none';
        }
      }, {
        capture: false,
        passive: true
      });
    }
  }
  window.customElements.define('top-button', TopButton);
})();
