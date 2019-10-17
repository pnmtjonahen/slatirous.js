/* https://regex101.com */
/* https://github.com/showdownjs/showdown/tree/master/src/subParsers/makehtml */

'use strict';

class MarkdownConverter {

    toHtml(id, entry) {

        this.htmlBlocks = [];
        this.contentIds = [];
        this.baseId = id;

        entry = this.parseCode(entry);
        entry = this.parseComments(entry);
        entry = this.parseImg(entry);
        entry = this.parseLink(entry);
        entry = this.parseHeader(entry);
        entry = this.parseTableOfContent(entry);
        entry = this.parseList(entry);
        entry = this.parseStep(entry);
        entry = this.parseBlockQuote(entry);
        entry = this.parseAccordion(entry);
        entry = this.parseParagraphs(entry);
        entry = this.unhashHtmlCode(entry);

        return `<div class="blog">${entry}</div>`;
    }

    hasTableOfContent(entry) {
        return entry.match(/^!table-of-content$/gm);
    }

    parseTableOfContent(entry) {
        return entry.replace(/!table-of-content/g, () => {
            return this.hashHtmlCode(`<p>Table of content</p>
        <ul>
        ${this.contentIds.map(contentId => {
                return `<li><a href="#${contentId.id}">${contentId.title}</a></li>`;
            }).join('')}
        </ul>`);
        });
    }

    parseBlockQuote(entry) {
        return entry.replace(/^> (.*)/gm, (match, p1) => {
            return this.hashHtmlCode(`<blockquote><p>${p1}</p></blockquote>`);
        });
    }
    parseAccordion(entry) {
        return entry.replace(/>{3}([\s\S]*?)<{3}/gm, (match, p1) => {
            const content = this.parseParagraphs(p1);
            return this.hashHtmlCode(`<div class="panel">${content}</div><button class="accordion"></button>`);
        });
    }

    parseHeader(entry) {
        const headerRegEx = /^(#{1,6})[ \t]+(.+)/gm;
        const idRegExp = /\s?\{([^{]+?)}\s*$/gm;
        const hasTableOfContent = this.hasTableOfContent(entry);

        return entry.replace(headerRegEx, (match, p1, p2) => {

            const hcontent = p2.replace(idRegExp, '');
            const ids = p2.match(idRegExp);
            if (hasTableOfContent && ids) {
                const id = this.baseId + "_" + ids[0].replace(/\{/gm, '').replace(/}/gm, '').trim().replace(/#/g, '');
                this.contentIds.push({id: id, title: hcontent});
                return this.hashHtmlCode(`<h${p1.length} class="section back" id="${id}">${hcontent}<span class="back"><a class="back" onClick="document.body.scrollTop = 0; document.documentElement.scrollTop = 0; return false;">^</a></span></h${p1.length}>`);
            }
            return this.hashHtmlCode(`<h${p1.length} class="section">${hcontent}</h${p1.length}>`);
        });
    }

    parseImg(entry) {
        const inlineImgRegEx = /!\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d|auto]+[A-Za-z%]{0,4})x([*\d|auto]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/gm;
        return entry.replace(inlineImgRegEx, (match, p1, p2, p3, p4, p5, p6, p7) => {
            const width = this.getSize(p4);
            const heigth = this.getSize(p5);
            return this.hashHtmlCode(`<div class="blog"><img src="${p3}" alt="${p1}" class="blog"${p4 && p5 ? ` style="width:${width}; height:${heigth}"` : ''}${p7 ? ` title="${p7}"` : ''}/></div>`);
        });
    }

    getSize(p) {
        if (!p) {
            return p;
        }
        if (p.endsWith('%')) {
            return p;
        }
        if (isNaN(p)) {
            return p;
        }
        return p + 'px';
    }

    parseLink(entry) {
        const inlineLinkRegEx = /\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/gm;
        return entry.replace(inlineLinkRegEx, (match, p1, p2, p3) => {
            return this.hashHtmlCode(`<a href="${p3}" target="_blank">${p1 ? p1 : p3}</a>`);
        });
    }

    parseCode(entry) {
        return entry.replace(/(?:^|\n)(?: {0,3})(```+)(?: *)([^\s`]*)\n([\s\S]*?)\n(?: {0,3})\1/gm, (matc, p1, p2, p3) => {
            const content = this.htmlEncodeXml(p3.replace(/^([ \t]*)/g, '')
                    .replace(/[ \t]*$/g, ''));
            return this.hashHtmlCode(`<pre ${p2 ? `class="${p2}"` : ''}>${content}</pre>`);
        });
    }

    htmlEncodeXml(text) {
        return text.replace(/<(?![a-z/?$!])/gi, '&lt;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
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

    parseParagraphs(entry) {

        entry = entry.replace(/^\n+/g, '');
        entry = entry.replace(/\n+$/g, '');

        const paras = entry.split(/\n{2,}/g);
        const parasParsed = [];

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

    parseComments(entry) {
        //TODO: parse xml comments
        return entry;
    }

    hashHtmlCode(html) {
        // hash the parsed html code and put it between tags. this will prevent other parser to reparse this already correct html
        return "PTJ-md" + (this.htmlBlocks.push(html) - 1) + "md-PTJ";
    }

    unhashHtmlCode(entry) {
        const htmlHashedBlockRegExp = /PTJ-md(.*?)md-PTJ/gm;
        return entry.replace(htmlHashedBlockRegExp, (match, p1) => {
            if (this.htmlBlocks[p1].match(htmlHashedBlockRegExp)) {
                return this.unhashHtmlCode(this.htmlBlocks[p1]);
            }
            return this.htmlBlocks[p1];
        });
    }
}

export const markdownConverter = new MarkdownConverter();
