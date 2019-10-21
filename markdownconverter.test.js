/* global describe, it, expect */
'use strict';

import {markdownConverter} from './markdownconverter.js';

describe('Markdown plus Parser', () => {
  it('parse empty entry', () => {
      var result = markdownConverter.toHtml("id1", '');
      expect(result).toEqualCaseInsensitive(`<div class="blog"></div>`);
  });
describe('Test code block generation', () => {
  it('parse code block with class', () => {
    var result = markdownConverter.toHtml("id1", '```code\n\n<html></html>\n\n```');
    expect(result).toEqualCaseInsensitive(`<div class="blog"><pre class="code">
&lt;html&gt;&lt;/html&gt;

</pre></div>`);
  });
  it('parse code plain html', () => {
    var result = markdownConverter.toHtml("id1", '```\n\n<html></html>\n\n```');
    expect(result).toEqualCaseInsensitive(`<div class="blog"><pre >
&lt;html&gt;&lt;/html&gt;

</pre></div>`);
  });
});

describe('Test H1,H2,H3,H4,H5,H6 generation', () => {
  it('parse headers', () => {
    var result = markdownConverter.toHtml("id1",`# H1
## H2
### H3
#### H4
##### H5
###### H6
#hashtag`);
    expect(result).toEqualCaseInsensitive(`<div class="blog"><h1 class="section">H1</h1>
<h2 class="section">H2</h2>
<h3 class="section">H3</h3>
<h4 class="section">H4</h4>
<h5 class="section">H5</h5>
<h6 class="section">H6</h6>
#hashtag</div>`);
  });

  it('parse headers with id', () => {
    var result = markdownConverter.toHtml("id1",`# H1 {#myid}`);
    expect(result).toEqualCaseInsensitive(`<div class="blog"><h1 class="section">H1</h1></div>`);
  });

  it('parse headers with nested link', () => {
    var result = markdownConverter.toHtml("id1",`# H1 [blog](http://localhost) {#myid}`);
    expect(result).toEqualCaseInsensitive(`<div class="blog"><h1 class="section">H1 <a href="http://localhost" target="_blank">blog</a></h1></div>`);
  });
});
  it('parse table of content', () => {
    var result = markdownConverter.toHtml("id1",`!table-of-content
# H1 {#myid}`);
    expect(result).toEqualCaseInsensitive(`<div class="blog"><p>Table of content</p>
        <ul>
        <li><a href="#id1_myid">H1</a></li>
        </ul>
<h1 class="section back" id="id1_myid">H1<span class="back"><a class="back" onClick="document.body.scrollTop = 0; document.documentElement.scrollTop = 0; return false;">^</a></span></h1></div>`);
  });
describe('Test img tags generation', () => {
  it('parse img inside text', () => {
    expect(markdownConverter.toHtml("id1",'pre text ![](img.jpg) post text'))
      .toEqualCaseInsensitive(`<div class="blog"><p>pre text <div class="blog"><img src="img.jpg" alt="" class="blog"/></div> post text</p></div>`);
  });
  it('parse img with styling', () => {
    expect(markdownConverter.toHtml("id1",'![img](img.jpg =autox100%)'))
      .toEqualCaseInsensitive(`<div class="blog"><div class="blog"><img src="img.jpg" alt="img" class="blog" style="width:auto; height:100%"/></div></div>`);
  });
  it('parse img with styling fixed size', () => {
    expect(markdownConverter.toHtml("id1",'![img](img.jpg =100x100)'))
      .toEqualCaseInsensitive(`<div class="blog"><div class="blog"><img src="img.jpg" alt="img" class="blog" style="width:100px; height:100px"/></div></div>`);
  });
  it('parse img with title', () => {
    expect(markdownConverter.toHtml("id1",'![img](img.jpg "title")'))
      .toEqualCaseInsensitive(`<div class="blog"><div class="blog"><img src="img.jpg" alt="img" class="blog" title="title"/></div></div>`);
  });
});
describe('Test anchor tag generation', () => {
  it('parse link inside text', () => {
    expect(markdownConverter.toHtml("id1",'pre text [](img.html) post text'))
      .toEqualCaseInsensitive(`<div class="blog"><p>pre text <a href="img.html" target="_blank">img.html</a> post text</p></div>`);
  });

  it('parse link with embedded img', () => {
    expect(markdownConverter.toHtml("id1",'[![img](img.jpg =autox100%)](img.html)'))
      .toEqualCaseInsensitive(`<div class="blog"><a href="img.html" target="_blank"><div class="blog"><img src="img.jpg" alt="img" class="blog" style="width:auto; height:100%"/></div></a></div>`);
  });
});
describe('Test ul/li generation', () => {
  it('parse list, single list', () => {
    expect(markdownConverter.toHtml("id1",`
- single
`))
      .toEqualCaseInsensitive(`<div class="blog"><ul><li>single</li></ul></div>`);
  });

  it('parse list, double list, non list', () => {
    expect(markdownConverter.toHtml("id1",`
- first
- second

- 1.1
- 1.2
- 1.3

-None
`))
      .toEqualCaseInsensitive(`<div class="blog"><ul><li>first</li><li>second</li></ul>
<ul><li>1.1</li><li>1.2</li><li>1.3</li></ul>
<p>-None</p></div>`);
  });
});

  it('parse steps', () => {
    expect(markdownConverter.toHtml("id1",`
-Step one
-Step Two
- ignore
-None
`))
      .toEqualCaseInsensitive(`<div class="blog"><p class="step">one</p>
<p class="step">Two</p>
<ul><li>ignore</li></ul>
-None</div>`);
  });

  it('parse paragraphs', () => {
    expect(markdownConverter.toHtml("id1",`
Line one
Line Two

Line Three

`))
      .toEqualCaseInsensitive(`<div class="blog"><p>Line one
Line Two</p>
<p>Line Three</p></div>`);

  });

  it('parse block quotes', () => {
    expect(markdownConverter.toHtml("id1", `
> block quote
`))
    .toEqualCaseInsensitive(`<div class="blog"><blockquote><p>block quote</p></blockquote></div>`);
  });

 it('parse accordion', () => {
   expect(markdownConverter.toHtml("id1", `
before

>>>

Inside

<<<

after
`))
    .toEqualCaseInsensitive(`<div class="blog"><p>before</p>
<div class="panel"><p>Inside</p></div><button class="accordion"></button>
<p>after</p></div>`)
 });

});
