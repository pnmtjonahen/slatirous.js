class MdParser {
  constructor() {
    var htmlBlocks = [];
    var contentIds = [];
  }

  parseMd(blog, entry) {

    this.htmlBlocks = [];
    this.contentIds = [];
    this.currentBlog = blog;

    entry = this.parseCode(entry);
    entry = this.parseHeader(entry);
    entry = this.parseTableOfContent(entry);
    entry = this.parseImg(entry);
    entry = this.parseLink(entry);
    entry = this.parseList(entry);
    entry = this.parseStep(entry);
    entry = this.parseParagraphs(entry);
    entry = this.unhashHtmlCode(entry);

    return `<div class="blog">${entry}</div>`;
  }
  hasTableOfContent(entry) {
    return entry.match(/^!table\-of\-content$/gm);
  }



  parseTableOfContent(entry) {
    return entry.replace(/!table\-of\-content/g, (match) => {
      return this.hashHtmlCode(`<p>Table of content</p>
        <ul>
        ${this.contentIds.map(contentId => {
          return `<li><a href="#${contentId.id}">${contentId.title}</a></li>`;
        }).join('')}
        </ul>`);
    });
  }

  parseHeader(entry) {
    const headerRegEx = /^(#{1,6})[ \t]+(.+)/gm;
    const idRegExp = /\s?\{([^{]+?)}\s*$/gm;
    const hasTableOfContent = this.hasTableOfContent(entry);

    return entry.replace(headerRegEx, (match, p1, p2) => {

      var hcontent = p2.replace(idRegExp, '');
      var ids = p2.match(idRegExp);
      if (hasTableOfContent && ids) {
        var id = this.currentBlog.id + "_" + ids[0].replace(/\{/gm, '').replace(/}/gm, '').trim().replace(/#/g, '');
        this.contentIds.push({
          id: id,
          title: hcontent
        });
        return this.hashHtmlCode(`<h${p1.length} class="section back" id="${id}">${hcontent}<span class="back"><a class="back" onClick="document.body.scrollTop = 0; document.documentElement.scrollTop = 0; return false;">^</a></span></h${p1.length}>`);
      }
      return this.hashHtmlCode(`<h${p1.length} class="section">${hcontent}</h${p1.length}>`);
    });
  }

  parseImg(entry) {
    const inlineImgRegEx = /!\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d|auto]+[A-Za-z%]{0,4})x([*\d|auto]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/gm;
    return entry.replace(inlineImgRegEx, (match, p1, p2, p3, p4, p5) => {
      return this.hashHtmlCode(`<div class="blog"><img src="${p3}" alt="${p1}" class="blog" ${p4 && p5 ? `style="width:${p4}; height:${p5}"` : ''}/></div>`);
    });
  }

  parseLink(entry) {
    const inlineLinkRegEx = /\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/gm;
    return entry.replace(inlineLinkRegEx, (match, p1, p2, p3) => {
      return this.hashHtmlCode(`<a href="${p3}" target="_blank">${p1 ? p1 : p3}</a>`);
    });
  }

  parseCode(entry) {
    return entry.replace(/(?:^|\n)(?: {0,3})(```+)(?: *)([^\s`]*)\n([\s\S]*?)\n(?: {0,3})\1/gm, (matc, p1, p2, p3) => {
      p3 = p3.replace(/^([ \t]*)/g, '');
      p3 = p3.replace(/[ \t]*$/g, '');
      p3 = this.escapeXml(p3);
      return this.hashHtmlCode(`<pre ${p2 ? `class="${p2}"` :''}>${p3}</pre>`);
    });
  }

  parseList(entry) {
    entry = entry.replace(/^- (.*)/gm, (match, p1) => {
      return '¨1' + this.hashHtmlCode(`<li>${p1}</li>`) + '¨2';
    });
    return this.encloseList(entry);
  }

  encloseList(entry) {
    entry = entry.replace(/¨2(?:\r\n|\r|\n)¨1/gm, '');
    return entry.replace(/¨1(.+)¨2/gm, (match, p1) => {
        return this.hashHtmlCode(`<ul>${p1}</ul>`);
    });
  }

  parseStep(entry) {
    return entry.replace(/^-Step (.+)/gm, (match, p1) => {
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
        str = str.replace(/^\n+/g, '');
        str = str.replace(/\n+$/g, '');
        parasParsed.push(`<p>${str}</p>`);
      }
    });

    return parasParsed.join('\n');
  }

  hashHtmlCode(html) {
    // hash the parsed html code and put it between tags. this will prevent other parser to reparse this already correct html
    return "PTJ-md" + (this.htmlBlocks.push(html) - 1) + "md-PTJ";
  }

  unhashHtmlCode(entry) {
    const htmlHashedBlockRegExp = /PTJ-md(.*?)md-PTJ/gm;
    return entry.replace(htmlHashedBlockRegExp, (match, p1) => {
      // nested elements
      if (this.htmlBlocks[p1].match(htmlHashedBlockRegExp)) {
        return this.unhashHtmlCode(this.htmlBlocks[p1]);
      }
      return this.htmlBlocks[p1];
    });
  }
}

export const mdParser = new MdParser();
