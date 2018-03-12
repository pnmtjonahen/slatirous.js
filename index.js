/* global fetch, Node */

class IndexView {
    constructor() {

        fetch("blog.json").then(res => res.json()).then(json => {
            const blogContainer = document.getElementById("blog");

            json.forEach(blog => {
                blogContainer.appendChild(this.newBlog(blog));
            });
        });
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
        const title = document.createElement("div");

        title.className = "w3-container";
        const h3 = document.createElement("h3");
        const bold = document.createElement("b");
        bold.appendChild(document.createTextNode(blog.title));
        h3.appendChild(bold);
        title.appendChild(h3);

        const h5 = document.createElement("h5");
        h5.appendChild(document.createTextNode(blog.description + ", "));
        const span = document.createElement("span");
        span.className = "w3-opacity";
        span.appendChild(document.createTextNode(blog.date));

        h5.appendChild(span);
        title.appendChild(h5);

        div.append(title);
    }

    appendBlogEntry(div, blog) {
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

        div.append(entry);
    }
}
const view = new IndexView();



