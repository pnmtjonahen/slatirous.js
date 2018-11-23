/* global fetch, Node */

class IndexView {
    constructor() {

        fetch("blog.json").then(res => res.json()).then(json => {
            const blogContainer = document.getElementById("blog");
            const popularPostTemplate = document.getElementById("popular-post");
            const popularPostContainer = popularPostTemplate.parentNode;

            popularPostTemplate.removeAttribute("id");
            popularPostContainer.removeChild(popularPostTemplate);

            json.forEach(blog => {
                blogContainer.appendChild(this.newBlog(blog));
                popularPostContainer.appendChild(
                        this.replaceTemplateValues(
                                popularPostTemplate.cloneNode(true), blog));
            });
        });
    }

    replaceTemplateValues(node, blog) {

// replace template values using regex
        Array.from(node.childNodes)
                .filter(n => n.nodeType === Node.TEXT_NODE).forEach(n => {
            let name;
            if ((name = /\{(.*?)\}/.exec(n.nodeValue)) !== null) {
                n.nodeValue = blog[name[1]];
            }
        });

// replace template values using javascript key-value mapping
        Array.from(node.childNodes)
                .filter(n => n.nodeType !== Node.TEXT_NODE).forEach(n => {
            Array.from(n.attributes).forEach(attr => {
                Object.keys(blog).forEach(name => {
                    if (attr.value === "{" + name + "}") {
                        attr.value = blog[name];
                    }
                });
            });
            this.replaceTemplateValues(n, blog);
        });

        return node;
    }

    newBlog(blog) {
        const div = document.createElement("div");
        div.className = "w3-card-4 w3-margin w3-white";

        this.appendBlogTitle(div, blog);
        this.appendBlogEntry(div, blog);
        const hr = document.createElement("hr");
        div.appendChild(hr);

        return div;
    }

    appendBlogTitle(div, blog) {
// insert new html snippit using backticks and script values.
        const template = document.createElement('template');
        template.innerHTML = 
`<div class="w3-container">
    <h3><b>${blog.title}</b></h3>
    <h5>${blog.description}, <span class="w3-opacity">${blog.date}</span></h5>
</div>`;
        div.appendChild(template.content.firstChild);

    }

    appendBlogEntry(div, blog) {
// insert new html snippet using DOM api.        
        const entry = document.createElement("div");
        entry.className = "w3-container";

        const p = document.createElement("p");
        if (Array.isArray(blog.entry)) {
            blog.entry.forEach(e => {
                const subp = document.createElement("p");
                subp.appendChild(document.createTextNode(e));
                p.appendChild(subp);
            });
        } else {
            p.appendChild(document.createTextNode(blog.entry));
        }
        entry.appendChild(p);

        div.appendChild(entry);
    }
}
const view = new IndexView();



