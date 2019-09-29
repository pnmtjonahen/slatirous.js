/* global fetch, Node */

class IndexView {
    constructor() {
        var htmlBlocks = [];
        var contentIds = [];
        var currentBlog;

        fetch("blog.json").then(res => res.json()).then(json => {

            this.blogs = json;
            const bookmarkRegExp = /(.*?)#([a-zA-Z]*)_?.*/;
            if (window.location.href.match(bookmarkRegExp)) {
              this.setCurrentBlog(window.location.href.replace(bookmarkRegExp, (match, p1, p2) => p2));
            } else {
              this.setCurrentBlog(this.blogs[0].id);
            }


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
      this.setBlog(this.blogs.filter(e => {
        return e.id === id;
      })[0]);
    }

    setBlog(blog) {
        this.currentBlog = blog;
// insert new html snippet using backticks notation and a dynamic template element
        const div = this.htmlTemplate(`<div class="w3-card-4 w3-margin w3-white">
        <div class="w3-container">
            <h3><b>${this.currentBlog.title}</b></h3>
            <h5>${this.currentBlog.description}, <span class="w3-opacity">${this.currentBlog.date}</span></h5>
        </div>
  </div>`);

        div.appendChild(this.appendBlogEntry());

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

    appendBlogEntry() {
// insert new html snippet using DOM api.
        const entry = document.createElement("div");
        entry.className = "w3-container";
        fetch("blog/" + this.currentBlog.id + ".md").then(res => res.text()).then(md => {
            entry.appendChild(this.parseMd(md));
        });
        return entry;
    }

    parseMd(entry) {

      this.htmlBlocks = [];
      this.contentIds = [];
      entry = this.parseHeader(entry);
      entry = entry.replace(/!table\-of\-content/g, (match) => {
        return this.hashHtmlCode(`<p>Table of content</p>
        <ul>
        ${this.contentIds.map(contentId => {
          return `<li><a href="#${contentId.id}">${contentId.title}</a></li>`;
        }).join('')}
        </ul>`);
      });
      entry = this.parseImg(entry);
      entry = this.parseLink(entry);
      entry = this.parseCode(entry);
      entry = this.parseList(entry);
      entry = this.parseStep(entry);
      entry = this.parseParagraphs(entry);

      entry = entry.replace(/PTJ-md(.*?)md-PTJ/gm, (match, p1) => {
          return this.htmlBlocks[p1];
      });
// nested elements
      entry = entry.replace(/PTJ-md(.*?)md-PTJ/gm, (match, p1) => {
          return this.htmlBlocks[p1];
      });


      return this.htmlTemplate(`<div class="blog">${entry}</div>`);

    }

    hasTableOfContent(entry) {
      return entry.match(/^!table\-of\-content$/gm);
    }

    parseHeader(entry) {
      const headerRegEx = /^(#{1,6})[ \t]+(.+)/gm;
      const idRegExp = /\s?\{([^{]+?)}\s*$/gm;
      const hasTableOfContent = this.hasTableOfContent(entry);

      return entry.replace(headerRegEx, (match, p1, p2) => {

        var hcontent = p2.replace(idRegExp, '');
        var ids = p2.match(idRegExp);
        if (hasTableOfContent && ids) {
          var id = this.currentBlog.id + "_" + ids[0].replace(/\{/gm, '').replace(/}/gm, '').trim().replace(/#/g,'');
          this.contentIds.push({id : id, title: hcontent});
          return this.hashHtmlCode('<h' + p1.length +' class="section" id="'+ id+'">' + hcontent + '</h' + p1.length + '>\n');
        }
        return this.hashHtmlCode('<h' + p1.length +' class="section">' + hcontent + '</h' + p1.length + '>\n');
      });
    }

    parseImg(entry) {
      const inlineImgRegEx = /!\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d|auto]+[A-Za-z%]{0,4})x([*\d|auto]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/gm;
      return entry.replace(inlineImgRegEx, (match, p1, p2, p3, p4, p5) => {
        return this.hashHtmlCode(`<div class="blog"><img src="${p3}" alt="${p1}" class="blog" ${p4 && p5 ? `style="width:${p4}; height:${p5}"` : ''} /></div>`);
      });
    }

    parseLink(entry) {
      const inlineLinkRegEx = /\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/gm;
      return entry.replace(inlineLinkRegEx, (match, p1, p2, p3) => {
        return this.hashHtmlCode(`<a href="${p3}" target="_blank">${p1 ? p1 : p3}</a>`);
      });
    }

    parseCode(entry) {
      const codeRegExp = /(?:^|\n)(?: {0,3})(```+)(?: *)([^\s`]*)\n([\s\S]*?)\n(?: {0,3})\1/gm;
      return entry.replace(codeRegExp, (matc, p1, p2, p3) => {
        p3 = p3.replace(/^([ \t]*)/g, '');
        p3 = p3.replace(/[ \t]*$/g, '');
        p3 = this.escapeXml(p3);
        return this.hashHtmlCode(`<pre ${p2 ? `class="${p2}"` :''}>${p3}</pre>`);
      });
    }

    parseList(entry) {
      const startListRegExp = /^\n{1} ?[*+-][ \t](.*)/gm;
      const endListRegExp = /^[*+-][ \t](.*)\n$/gm;
      const listRegExp = /^[*+-][ \t](.*)/gm;
      const nrItems = entry
      entry = entry.replace(startListRegExp, (match, p1) => {
          return this.hashHtmlCode(`<p><ul><li>${p1}</li>`);
      });
      entry = entry.replace(endListRegExp, (match, p1) => {
          return this.hashHtmlCode(`<li>${p1}</li></ul></p>`);
      });

      return entry.replace(listRegExp, (match, p1) => {
          return this.hashHtmlCode(`<li>${p1}</li>`);
      });

    }

    parseStep(entry) {
      const stepRegExp = /^-Step (.+)/gm;
      return entry.replace(stepRegExp, (match, p1) => {
          return this.hashHtmlCode(`<p class="step">${p1}</p>`);
      });
    }

    escapeXml(text) {
      return text.replace(/<(?![a-z\/?$!])/gi, '&lt;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');
    }
    parseParagraphs(text) {

      text = text.replace(/^\n+/g, '');
      text = text.replace(/\n+$/g, '');

      var paras = text.split(/\n{2,}/g);
      var parasParsed = [];

      paras.forEach(str => {
        if (str.startsWith("PTJ-md")) {
            parasParsed.push(str);
        } else if (str.search(/\S/) >= 0) {
            parasParsed.push('<p>' + str + '</p>');
        }
      });

      return parasParsed.join('\n');
    }

    hashHtmlCode(html) {
      // hash the parsed html code and put it between tags. this will prevent other parser to reparse this already correct html
      return "PTJ-md"+(this.htmlBlocks.push(html) -1) +"md-PTJ";
    }

}
const view = new IndexView();
