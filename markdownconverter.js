/* https://regex101.com */
/* https://github.com/showdownjs/showdown/tree/master/src/subParsers/makehtml */

'use strict';

class MarkdownConverter {

    toHtml(id, entry) {

        this.htmlBlocks = [];
        this.tableOfContentIds = [];
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
        entry = this.unHashHtmlCode(entry);

        return `<div class="blog">${entry}</div>`;
    }

    hasTableOfContent(entry) {
        return entry.match(/^!table-of-content$/gm);
    }

    parseTableOfContent(entry) {
        return entry.replace(/!table-of-content/g, () => {
            return this.hashHtmlCode(`<p>Table of content</p>
        <ul>
        ${this.tableOfContentIds.map(contentId => {
                return `<li><a href="#${contentId.id}">${contentId.title}</a></li>`;
            }).join('')}
        </ul>`);
        });
    }

    parseBlockQuote(entry) {
        return entry.replace(/^> (.*)/gm, (match, content) => {
            return this.hashHtmlCode(`<blockquote><p>${content}</p></blockquote>`);
        });
    }
    parseAccordion(entry) {
        return entry.replace(/>{3}([\s\S]*?)<{3}/gm, (match, panelContent) => {
            const paragraphed = this.parseParagraphs(panelContent);
            return this.hashHtmlCode(`<div class="panel">${paragraphed}</div><button class="accordion"></button>`);
        });
    }

    parseHeader(entry) {
        const headerRegEx = /^(#{1,6})[ \t]+(.+)/gm;
        const idRegExp = /\s?\{([^{]+?)}\s*$/gm;
        const hasTableOfContent = this.hasTableOfContent(entry);

        return entry.replace(headerRegEx, (match, hashtags, header) => {

            const content = header.replace(idRegExp, '');
            const ids = header.match(idRegExp);
            if (hasTableOfContent && ids) {
                const id = this.baseId + "_" + ids[0].replace(/\{/gm, '').replace(/}/gm, '').trim().replace(/#/g, '');
                this.tableOfContentIds.push({id: id, title: content});
                return this.hashHtmlCode(`<h${hashtags.length} class="section back" id="${id}">${content}<span class="back"><a class="back" onClick="document.body.scrollTop = 0; document.documentElement.scrollTop = 0; return false;">^</a></span></h${hashtags.length}>`);
            }
            return this.hashHtmlCode(`<h${hashtags.length} class="section">${content}</h${hashtags.length}>`);
        });
    }

    parseImg(entry) {
        const inlineImgRegEx = /!\[([^\]]*?)][ \t]*\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d|auto]+[A-Za-z%]{0,4})x([*\d|auto]+[A-Za-z%]{0,4}))?[ \t]*(?:["']([^"]*?)["'])?[ \t]?\)/gm;
        return entry.replace(inlineImgRegEx, (match, alt, src, rawWidth, rawHeight, title) => {
            const style = this.determineStyle(rawWidth, rawHeight);
            return this.hashHtmlCode(`<div class="blog"><img src="${src}" alt="${alt}" class="blog"${style}${title ? ` title="${title}"` : ''}/></div>`);
        });
    }

    determineStyle(rawWidth, rawHeight) {
        const width = this.getSize(rawWidth);
        const height = this.getSize(rawHeight);
        if (rawWidth && rawHeight) {
            return ` style="width:${width}; height:${height}"`;
        }
        return '';
    }

    getSize(rawSize) {
        if (!rawSize) {
            return rawSize;
        }
        if (rawSize.endsWith('%')) {
            return rawSize;
        }
        if (isNaN(rawSize)) {
            return rawSize;
        }
        return rawSize + 'px';
    }

    parseLink(entry) {
        return entry.replace(/\[(.*)\]\((.*)\)/gm, (match, content, href) => {
            return this.hashHtmlCode(`<a href="${href}" target="_blank">${content ? content : href}</a>`);
        });
    }

    parseCode(entry) {
        return entry.replace(/^```([^\s`]*)\n([\s\S]*?)```/gm, (match, codeClass, rawContent) => {
            const content = this.htmlEncodeXml(rawContent.replace(/^([ \t]*)/g, '').replace(/[ \t]*$/g, ''));
            return this.hashHtmlCode(`<pre ${codeClass ? `class="${codeClass}"` : ''}>${content}</pre>`);
        });
    }

    htmlEncodeXml(text) {
        return text.replace(/<(?![a-z/?$!])/gi, '&lt;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    parseList(entry) {
        entry = entry.replace(/^- (.*)/gm, (match, content) => {
            return '¨1' + this.hashHtmlCode(`<li>${content}</li>`) + '¨2';
        });
        return this.encloseList(entry);
    }

    encloseList(entry) {
        entry = entry.replace(/¨2(?:\r\n|\r|\n)¨1/gm, '');
        return entry.replace(/¨1(.+)¨2/gm, (match, hashedLiContent) => {
            return this.hashHtmlCode(`<ul>${hashedLiContent}</ul>`);
        });
    }

    parseStep(entry) {
        return entry.replace(/^-Step (.+)/gm, (match, content) => {
            return this.hashHtmlCode(`<p class="step">${content}</p>`);
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
        // hash the parsed html code and put it between special markers. this will prevent other parser to re-parse this already correct html
        return "PTJ-md" + (this.htmlBlocks.push(html) - 1) + "md-PTJ";
    }

    unHashHtmlCode(entry) {
        const htmlHashedBlockRegExp = /PTJ-md(.*?)md-PTJ/gm;
        return entry.replace(htmlHashedBlockRegExp, (match, hashedBlockId) => {
            if (this.htmlBlocks[hashedBlockId].match(htmlHashedBlockRegExp)) {
                return this.unHashHtmlCode(this.htmlBlocks[hashedBlockId]);
            }
            return this.htmlBlocks[hashedBlockId];
        });
    }
}

export const markdownConverter = new MarkdownConverter();
