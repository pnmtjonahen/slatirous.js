'use strict';

import { markdownConverter } from './markdownconverter.js';

class IndexView {
    constructor() {
        fetch("blog.json")
                .then(res => {
                    if (!res.ok) {
                        throw Error(res.statusText);
                    }
                    return res.json();
                })
                .then(json => {
                    this.blogs = json.filter(b => !b.hide);
                    this.setBlog(this.determineInitialBlog());
                    this.addOlderBlogs();
                })
                .catch(error => {
                    console.log("failed fetch blog.json : " + error);
                });
    }

    addOlderBlogs() {
        const olderPostTemplate = document.getElementById("older-post");
        const olderPostContainer = olderPostTemplate.parentNode;
        this.blogs.forEach(blog => {
            var node = this.replaceTemplateValues(olderPostTemplate.content.cloneNode(true), blog);
            this.updateOlderBlogOnClick(node, blog);
            olderPostContainer.appendChild(node);
        });
    }

    determineInitialBlog() {
        // const bookmarkRegExp = /(.*?)#([a-zA-Z0-9]*)_?.*/;
        const bookmarkRegExp = /(?:.*?)\?blog=([a-zA-Z0-9]*)(?:#([a-zA-Z0-9]*))?/;

        if (window.location.href.match(bookmarkRegExp)) {
            let id = window.location.href.replace(bookmarkRegExp, (match, blogId) => blogId);
            // TODO: Jump to bookmark
            const blog = this.blogs.filter(e => e.id === id)[0];
            return blog === undefined ? this.blogs[0] : blog;
        }
        return this.blogs[0];
    }

    updateOlderBlogOnClick(node, blog) {
        node.getElementById(blog.id).onclick = () => {
            window.scrollTo({top: 0, behavior: 'smooth'});
            this.setBlog(blog);
        };
    }

    replaceTemplateValues(node, blog) {
        this.replaceTemplateValuesUsingRegExOnTextNodes(node, blog);
        this.replaceTemplateValuesUsingKeyValueMappingOnNoneTextNodes(node, blog);
        return node;
    }

    replaceTemplateValuesUsingRegExOnTextNodes(node, blog) {
        // replace template values using regex, get all child nodes, filter on text nodes and use a regex to replace the node value
        Array.from(node.childNodes)
                .filter(n => n.nodeType === Node.TEXT_NODE).forEach(n => {
            let name;
            if ((name = /\{(.*?)\}/.exec(n.nodeValue)) !== null) {
                n.nodeValue = blog[name[1]];
            }
        });
    }

    replaceTemplateValuesUsingKeyValueMappingOnNoneTextNodes(node, blog) {
        // replace template values using javascript key-value mapping
        Array.from(node.childNodes)
                .filter(n => n.nodeType !== Node.TEXT_NODE).forEach(n => {
            Array.from(n.attributes).forEach(attr => {
                // using Object.keys get all the attributes (aka keys) from the blog entry
                Object.keys(blog).forEach(name => {
                    if (attr.value === "{" + name + "}") {
                        attr.value = blog[name];
                    }
                });
                // replace template values using a regexp replace with function
                attr.value = attr.value.replace(/(.*?)\{(.*?)\}(.*)/, (match, p1, p2, p3) => {
                    return p1 + blog[p2] + p3;
                });
            });
            this.replaceTemplateValues(n, blog);
        });
        return node;
    }

    setBlog(blog) {
        window.history.replaceState("blog", blog.title, '?blog=' + blog.id);
        // insert new html snippet using back ticks notation and a dynamic template element
        const div = this.htmlTemplate(`<div class="w3-card-4 w3-margin w3-white">
  <div class="w3-container">
    <h1 class="section"><b>${blog.title}</b></h1>
    <h5>${blog.description}, <span class="w3-opacity">${blog.date}</span></h5>
  </div>
</div>`);

        div.appendChild(this.buildBlogEntry(blog));

        this.updateBlogContainer(div);
    }

    updateBlogContainer(div) {
        const blogContainer = document.getElementById("blog");
        if (blogContainer.hasChildNodes()) {
            blogContainer.replaceChild(div, blogContainer.firstChild);
        } else {
            blogContainer.appendChild(div);
        }
    }

    htmlTemplate(html) {
        const template = document.createElement('template');
        template.innerHTML = html;
        return template.content.firstChild;
    }

    buildBlogEntry(blog) {
        const blogEntry = this.htmlTemplate(`<div class="w3-container"></div>`);
        fetch("blog/" + blog.id + ".md")
                .then(res => {
                    if (!res.ok) {
                        throw Error(res.statusText);
                    }
                    return res.text();
                }).then(markdown => {
            var html = markdownConverter.toHtml(blog.id, markdown);
            blogEntry.appendChild(this.updatePanelOnClick(this.htmlTemplate(`<div class="blog">${html}</div>`)));
            this.updateBlogTags(blog);
        }).catch((error) => {
            console.log("failed fetch " + "blog/" + blog.id + ".md : " + error);
        });
        return blogEntry;
    }

    updatePanelOnClick(div) {
        var acc = div.getElementsByClassName("accordion");
        var i;

        for (i = 0; i < acc.length; i++) {
            acc[i].innerHTML = "More...";
            acc[i].addEventListener("click", function (e) {
                var panel = this.previousElementSibling;
                if (panel.style.display === "block") {
                    e.target.innerHTML = "More...";
                    panel.style.display = "none";
                } else {
                    e.target.innerHTML = "Less...";
                    panel.style.display = "block";
                }
            });
        }
        return div;
    }

    updateBlogTags(blog) {
        var tags = document.getElementById("tags");
        while (tags.lastChild) {
            tags.removeChild(tags.lastChild);
        }
        if (!blog.tags) {
            return;
        }
        tags.appendChild(this.htmlTemplate(`<p>${blog.tags.map((t) =>
                `<span class="w3-tag w3-light-grey w3-small w3-margin-bottom">${t}</span> `).join('')}</p>`));
    }
}
export {IndexView};
