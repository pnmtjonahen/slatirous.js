# A top-button WebComponent

When setting up and extending my blog I came to the conclusion that it would be very handy to have a "goto top button" when the user scrolls down.

The first implementation was done by following [](https://www.w3schools.com/howto/howto_js_scroll_to_top.asp). A simple and IMHO a nice way to implement it.

But...

As always there is a but, and in this case it was my wish to create a webcomponent using plain javascript. Why just because I cannot/can.

Goto [](https://www.webcomponents.org/introduction) to find out more about webcomponents.

As it turned out it was a rather long search for finding correct information on how to do this. Lots of misleading/old tutorials and technical documentation explaining the what and not the how.

But eventually I came up with the following:

-Step is of course to create a new js file that will contain your component.
```bash
touch topbotton.js
```
Or similar ways to create a new file.

-Step is include this js file into your main html file.

```code
<script src="./topbutton.js" type="module"></script>
```
Notice the type="module" this makes it ES6 Module. See [](https://html.spec.whatwg.org/multipage/webappapis.html#integration-with-the-javascript-module-system).

-Step is to define the initial javascript code for our new webcomponent and make it available as a customElement.

```code
class TopButton extends HTMLElement {
  constructor() {
    super();
  }
}
window.customElements.define('top-button', TopButton);
```
At this point the code will do nothing, except that we now can place our new html element on our page.

[](https://w3c.github.io/webcomponents/spec/custom/) for more info on custom elements.

```code
<top-button></top-button>
```
Notice that it is a non self closing tag. This step makes up the infra structure of defining and using a webcomponent. The component itself is not doing any thing at the moment. We will change that in the next step.

-Step is to display something.
We change the constructor method to get the shadow DOM and add some content.

[](https://w3c.github.io/webcomponents/spec/shadow/) for more info on what the shadow DOM is.

```code
const template = document.createElement('template');
template.innerHTML = `<h1>Hello</h1>`;

this._shadowRoot = this.attachShadow({ 'mode': 'open' });
this._shadowRoot.appendChild(template.content.cloneNode(true));
```
Here we create a template node and sets its innerHTML. Using back tick notation. And append it to the shadow DOM of our component.

[](https://html.spec.whatwg.org/multipage/scripting.html#the-template-element/) for more info on template/slot elements.

Using javascript we now can manipulate our dom. Add nodes to it add, eventhandlers etc etc.

## TL;DR;
This is the final code for my top-button webcomponent.

- See [](https://benmarshall.me/attaching-javascript-handlers-to-scroll-events/) on why scroll is done this way.
- See [](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#iife) on the IIFE.



```code
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
        'mode': 'open'
      });
      this._shadowRoot.appendChild(template.content.cloneNode(true));
      var topbutton = this._shadowRoot.getElementById("topbutton");

      // When the user clicks on the button, scroll to the top of the document
      this.addEventListener('click', e => {
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
            topbutton.style.display = "block";
          } else {
            topbutton.style.display = "none";
          }
        }
      }, 250);

      // or for modern browsers
      document.addEventListener('wheel', (evt) => {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
          topbutton.style.display = "block";
        } else {
          topbutton.style.display = "none";
        }
      }, {
        capture: false,
        passive: true
      });
    }
  }
  window.customElements.define('top-button', TopButton);
})();

```

So next time you need a webcomponent, you know how to do it.
