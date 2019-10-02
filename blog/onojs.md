JavaScript is dead, long live JavaScript, How to build JS applications without extra dependencies.

This is the first blog entry about building a web application/frontend without any extra dependencies. Can I? and Must I?

## Simple DOM manipulation

There is no need for extra libraries to manipulate the DOM. We can use the same API as a framework uses. It is cumbersome, bud for simple projects it is feasible.

```code
// create new DOM element. The element is not added to the DOM.
  const entry = document.createElement("div");

// class attribute to set the css class is called className,
// as the class is a jsvascript reserved keyword to reference the class
  entry.className = "w3-container";
  entry.appendChild(document.createTextNode("Some text inside a div element"));

// now we add the new div element to our DOM
  const parent = document.getElementById("parent");
  parent.appendChild(entry);

```

## Getting data from backend

Fetching data from a backend is as easy as calling a fetch.

```code
fetch("data.json").then(res => res.json()).then(json => {
  // process the data is json

});

```

Converting the response into a json object is as simple as calling the json() method on the response.

## Little more advance DOM manipulation

There is also the possibility to create a template element, and then using backtick notations to enter html.  

```code
// first we create a new template node
  const template = document.createElement('template');

// the set the inner html
  template.innerHTML = `<div class="w3-container">Some text inside a div element</div>`;

// now we add the new div element to our DOM
  const parent = document.getElementById("parent");
  parent.appendChild(template.content.firstChild);

```

## Other usage of a template node

It is also possible to add a template node inside your html file and then using javascript get the template manipulate the content of the template and add it to the DOM.

```code
<body>
  <template id="my-template">
    <div class="w3-container">Some text inside a div element</div>
  </template>
</body>
```

Then in javascript we can write

```code
// get the template node.
const template = document.getElementById("my-template");

// clone the template (deep) else the actual template is changed
const element = template.content.cloneNode(true);

// modify the template, and add it to the DOM
const parent = document.getElementById("parent");
parent.appendChild(element);
```

## Modifying the template

As in javascript every thing is a hashmap, we can use this to get attributes from an object.

Or use a regex to replace values.

```code
replaceTemplateValues(node, dataObject) {

// replace template values using regex
    Array.from(node.childNodes)
            .filter(n => n.nodeType === Node.TEXT_NODE).forEach(n => {
        let name;
        if ((name = /\{(.*?)\}/.exec(n.nodeValue)) !== null) {
            n.nodeValue = dataObject[name[1]];
        }
    });

// replace template values using javascript key-value mapping
    Array.from(node.childNodes)
            .filter(n => n.nodeType !== Node.TEXT_NODE).forEach(n => {
        Array.from(n.attributes).forEach(attr => {
            Object.keys(dataObject).forEach(name => {
                if (attr.value === "{" + name + "}") {
                    attr.value = dataObject[name];
                }
            });
// replace template values using a regexp replace with function
            attr.value = attr.value.replace(/(.*?)\{(.*?)\}(.*)/, (match, p1, p2, p3) => {
              return p1 + dataObject[p2] + p3;
            });
        });
// recursive call self        
        this.replaceTemplateValues(n, dataObject);
    });

    return node;
}
```
