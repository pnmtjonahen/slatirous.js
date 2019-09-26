/* global fetch, Node */

class IndexView {
    constructor() {
        fetch("blog.json").then(res => res.json()).then(json => {

            this.blogs = json;
            const bookmarkRegExp = /(.*?)#(.*)/;
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
// insert new html snippet using backticks notation and a dynamic template element
        const div = this.htmlTemplate(`<div class="w3-card-4 w3-margin w3-white">
        <div class="w3-container">
            <h3><b>${blog.title}</b></h3>
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
        fetch("blog/" + blog.id + ".md").then(res => res.text()).then(md => {
            entry.appendChild(this.parseMd(md));
        });
        return entry;
    }

    parseMd(entry) {
      var htmlBlocks = [];
      entry = this.parseHeader(entry, htmlBlocks);
      entry = this.parseImg(entry, htmlBlocks);
      entry = this.parseLink(entry, htmlBlocks);
      entry = this.parseCode(entry, htmlBlocks);
      entry = this.parseParagraphs(entry, htmlBlocks);

      entry = entry.replace(/PTJ-md(.*?)md-PTJ/gm, (match, p1) => {
          return htmlBlocks[p1];
      });
// nested elements
      entry = entry.replace(/PTJ-md(.*?)md-PTJ/gm, (match, p1) => {
          return htmlBlocks[p1];
      });


      return this.htmlTemplate(`<div class="blog">${entry}</div>`);

    }

    parseHeader(entry, htmlBlocks) {
      const headerRegEx = /^(#{1,6})[ \t]+(.+)/gm;
      return entry.replace(headerRegEx, (match, p1, p2) => {
        return this.hashHtmlCode('<h' + p1.length +'>' + p2 + '</h' + p1.length + '>\n', htmlBlocks);
      });
    }

    parseImg(entry, htmlBlocks) {
      const inlineImgRegEx = /!\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d|auto]+[A-Za-z%]{0,4})x([*\d|auto]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/gm;
      return entry.replace(inlineImgRegEx, (match, p1, p2, p3, p4, p5) => {
        return this.hashHtmlCode(`<div class="blog"><img src="${p3}" alt="${p1}" class="blog" ${p4 && p5 ? `style="width:${p4}; height:${p5}"` : ''} /></div>`, htmlBlocks);
      });
    }

    parseLink(entry, htmlBlocks) {
      const inlineLinkRegEx = /\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/gm;
      return entry.replace(inlineLinkRegEx, (match, p1, p2, p3) => {
        return this.hashHtmlCode(`<a href="${p3}" target="_blank">${p1 ? p1 : p3}</a>`, htmlBlocks);
      });
    }

    parseCode(entry, htmlBlocks) {
      const codeRegExp = /(?:^|\n)(?: {0,3})(```+)(?: *)([^\s`]*)\n([\s\S]*?)\n(?: {0,3})\1/gm;
      return entry.replace(codeRegExp, (matc, p1, p2, p3) => {
        p3 = p3.replace(/^([ \t]*)/g, '');
        p3 = p3.replace(/[ \t]*$/g, '');
        p3 = this.escapeXml(p3);
        return this.hashHtmlCode(`<pre ${p2 ? `class="${p2}"` :''}>${p3}</pre>`, htmlBlocks);
      });
    }

    escapeXml(text) {
      return text.replace(/<(?![a-z\/?$!])/gi, '&lt;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');
    }
    parseParagraphs(text, htmlBlocks) {

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

    hashHtmlCode(html, htmlBlocks) {
      // hash the parsed html code and put it between tags. this will prevent other parser to reparse this already correct html
      return "PTJ-md"+(htmlBlocks.push(html) -1) +"md-PTJ";
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
          return `<img src="${p3}" alt="${p1}" class="blog"/>`
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
