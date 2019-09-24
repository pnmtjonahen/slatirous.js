/* global fetch, Node */

class IndexView {
    constructor() {
        const bookmarked = window.location.href.replace(/(.*?)#(.*)/, (match, p1, p2) => {
            return p2;
        });
        fetch("blog.json").then(res => res.json()).then(json => {

            this.blogs = json;
            this.setCurrentBlog(bookmarked ? bookmarked : this.blogs[0].id);
            

            const popularPostTemplate = document.getElementById("popular-post");
            const popularPostContainer = popularPostTemplate.parentNode;
            this.blogs.forEach(blog => {
                popularPostContainer.appendChild(
                        this.replaceTemplateValues(
                                popularPostTemplate.content.cloneNode(true), blog));
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
// replace template values using a regexp replace with function
                attr.value = attr.value.replace(/(.*?)\{(.*?)\}(.*)/, (match, p1, p2, p3) => {
                  return p1 + blog[p2] + p3;
                });
            });
            this.replaceTemplateValues(n, blog);
        });

        return node;
    }

    setCurrentBlog(id) {
      this.setBlog(this.blogs.filter(e => {
        return e.id === id;
      })[0]);
    }

    setBlog(blog) {
// insert new html snippet using backticks notation and a dynamic template element
        const div = this.htmlTemplate(`<div class="w3-card-4 w3-margin w3-white">
        <div class="w3-container">
            <h3><b>${blog.title}</b></h3>
            <h5>${blog.description}, <span class="w3-opacity">${blog.date}</span></h5>
        </div>
  </div>`);

        this.appendBlogEntry(div, blog);

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

    appendBlogEntry(div, blog) {
// insert new html snippet using DOM api.
        const entry = document.createElement("div");
        entry.className = "w3-container";

        const p = document.createElement("p");
        if (Array.isArray(blog.entry)) {
            blog.entry.forEach(e => {
                p.appendChild(this.determineType(e));
            });
        } else {
            p.appendChild(document.createTextNode(blog.entry));
        }
        entry.appendChild(p);

        div.appendChild(entry);
    }

    determineType(entry) {
      const inlineImgRegEx = /^!\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/;
      const inlineLinkRegEx = /^\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/;
      const headerRegEx = /^(#{1,6})[ \t]+(.+)/;
      if (entry.match(headerRegEx)) {
        return this.htmlTemplate(entry.replace(headerRegEx, (match, p1, p2) => {
          return '<h' + p1.length +'>' + p2 + '</h' + p1.length + '>';
        }));
      } else if (entry.match(inlineImgRegEx)) {
        return this.htmlTemplate(entry.replace(inlineImgRegEx, (match, p1, p2, p3) => {
          return `<div class="blog"><img src="${p3}" alt="${p1}" class="blog"/></div>`
        }));
      } else if (entry.match(inlineLinkRegEx)) {
        return this.htmlTemplate(entry.replace(inlineLinkRegEx, (match, p1, p2, p3) => {
          return `<a href="${p3}" target="_blank">${p1 ? p1 : p3}</a>`;
        }));
      }
      return this.htmlTemplate(`<p>${entry}</p>`);
    }

}
const view = new IndexView();
module.exports = view;
