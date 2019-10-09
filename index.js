/* global fetch, Node */
import {mdParser} from './mdparser.js'

class IndexView {
  constructor() {
    const blogs = [];
    fetch("blog.json")
    .then(res => {
      if (!res.ok) {
        throw Error(res.statusText);
      }
      return res.json();
    })
    .then(json => {

      this.blogs = json.filter(b => !b.hide);

      const bookmarkRegExp = /(.*?)#([a-zA-Z0-9]*)_?.*/;
      if (window.location.href.match(bookmarkRegExp)) {
        this.setCurrentBlog(window.location.href.replace(bookmarkRegExp, (match, p1, p2) => p2));
      } else {
        this.setCurrentBlog(this.blogs[0].id);
      }

      const popularPostTemplate = document.getElementById("popular-post");
      const popularPostContainer = popularPostTemplate.parentNode;
      this.blogs.forEach(blog => {
          var node = this.replaceTemplateValues(popularPostTemplate.content.cloneNode(true), blog);
          node = this.updateOnClick(node, blog);
          popularPostContainer.appendChild(node);
      });
    })
    .catch(error => {
        console.log("failed fetch blog.json : " + error);
    });
  }

  updateOnClick(node, blog) {
    var anchor = node.getElementById(blog.id);
    if (anchor) {
      anchor.onclick = () => {
        document.location = '#' + blog.id;
        // document.body.scrollTop = 0;
        // document.documentElement.scrollTop = 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // window.location.hash = blog.id
        this.setCurrentBlog(blog.id);
      }
    }
    return node;
  }
  replaceTemplateValues(node, blog) {

    // replace template values using regex, get all child nodes, filter on text nodes and use a regex to replace the node value
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

  setCurrentBlog(id) {
    console.log("loading " + id);
    this.setBlog(this.blogs.filter(e => {
      return e.id === id;
    })[0]);
  }

  setBlog(blog) {
    // insert new html snippet using backticks notation and a dynamic template element
    const div = this.htmlTemplate(`<div class="w3-card-4 w3-margin w3-white">
        <div class="w3-container">
            <h1 class="section"><b>${blog.title}</b></h1>
            <h5>${blog.description}, <span class="w3-opacity">${blog.date}</span></h5>
        </div>
  </div>`);

    div.appendChild(this.appendBlogEntry(blog));

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

  appendBlogEntry(blog) {
    // insert new html snippet using DOM api.
    const entry = document.createElement("div");
    entry.className = "w3-container";
    fetch("blog/" + blog.id + ".md")
    .then(res => {
      if (!res.ok) {
        throw Error(res.statusText);
      }
      return res.text();
    }).then(md => {
      var html = mdParser.parseMd(blog, md);
      entry.appendChild(this.updatePanelOnClick(this.htmlTemplate(`<div class="blog">${html}</div>`)));
      this.appendTags(blog);
    }).catch((error) => {
      console.log("failed fetch " + "blog/" + blog.id + ".md : " + error);
    });
    return entry;
  }

  updatePanelOnClick(div) {
    var acc = div.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
      acc[i].innerHTML = "More...";
      acc[i].addEventListener("click", function(e) {
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

  appendTags(blog) {
    if (!blog.tags) {
      return;
    }
    var tags = document.getElementById("tags");
    while (tags.lastChild) {
      tags.removeChild(tags.lastChild);
    }
    tags.appendChild(this.htmlTemplate(`<p>${blog.tags.map((t) => {
        return `<span class="w3-tag w3-light-grey w3-small w3-margin-bottom">${t}</span> `;
    }).join('')}</p>`));
  }
}
export {IndexView};
