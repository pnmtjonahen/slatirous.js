/* global describe, it, expect */
'use strict';

import {mdParser} from './mdparser.js';

describe('Markdown plus Parser', () => {
  const blog = {
          id: "id1",
          title: "",
          description: "",
          date: "",
          imageurl: "",
          imagealt: ""
      };
  it('parse empty entry', () => {
      var result = mdParser.parseMd(blog, '');
      expect(result).toEqualCaseInsensitive(`<div class="blog"></div>`);
  });

  it('parse code block with class', () => {
    var result = mdParser.parseMd(blog, '```code\n\n<html></html>\n\n```');
    expect(result).toEqualCaseInsensitive(`<div class="blog"><pre class="code">
&lt;html&gt;&lt;/html&gt;
</pre></div>`);
  });
  it('parse code plain html', () => {
    var result = mdParser.parseMd(blog, '```\n\n<html></html>\n\n```');
    expect(result).toEqualCaseInsensitive(`<div class="blog"><pre >
&lt;html&gt;&lt;/html&gt;
</pre></div>`);
  });

  it('parse headers', () => {
    var result = mdParser.parseMd(blog,`# H1
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
    var result = mdParser.parseMd(blog,`# H1 {#myid}`);
    expect(result).toEqualCaseInsensitive(`<div class="blog"><h1 class="section">H1</h1></div>`);
  });

  it('parse headers with nested link', () => {
    var result = mdParser.parseMd(blog,`# H1 [blog](http://localhost) {#myid}`);
    expect(result).toEqualCaseInsensitive(`<div class="blog"><h1 class="section">H1 <a href="http://localhost" target="_blank">blog</a></h1></div>`);
  });

  it('parse table of content', () => {
    var result = mdParser.parseMd(blog,`!table-of-content
# H1 {#myid}`);
    expect(result).toEqualCaseInsensitive(`<div class="blog"><p>Table of content</p>
        <ul>
        <li><a href="#id1_myid">H1</a></li>
        </ul>
<h1 class="section back" id="id1_myid">H1<span class="back"><a class="back" onClick="document.body.scrollTop = 0; document.documentElement.scrollTop = 0; return false;">^</a></span></h1></div>`);
  });

  it('parse img inside text', () => {
    expect(mdParser.parseMd(blog,'pre text ![](img.jpg) post text'))
      .toEqualCaseInsensitive(`<div class="blog"><p>pre text <div class="blog"><img src="img.jpg" alt="" class="blog"/></div> post text</p></div>`);
  });
  it('parse img with styling', () => {
    expect(mdParser.parseMd(blog,'![img](img.jpg =autox100%)'))
      .toEqualCaseInsensitive(`<div class="blog"><div class="blog"><img src="img.jpg" alt="img" class="blog" style="width:auto; height:100%"/></div></div>`);
  });
  it('parse img with styling fixed size', () => {
    expect(mdParser.parseMd(blog,'![img](img.jpg =100x100)'))
      .toEqualCaseInsensitive(`<div class="blog"><div class="blog"><img src="img.jpg" alt="img" class="blog" style="width:100px; height:100px"/></div></div>`);
  });
  it('parse img with title', () => {
    expect(mdParser.parseMd(blog,'![img](img.jpg "title")'))
      .toEqualCaseInsensitive(`<div class="blog"><div class="blog"><img src="img.jpg" alt="img" class="blog" title="title"/></div></div>`);
  });
  it('parse link inside text', () => {
    expect(mdParser.parseMd(blog,'pre text [](img.html) post text'))
      .toEqualCaseInsensitive(`<div class="blog"><p>pre text <a href="img.html" target="_blank">img.html</a> post text</p></div>`);
  });

  it('parse link with embedded img', () => {
    expect(mdParser.parseMd(blog,'[![img](img.jpg =autox100%)](img.html)'))
      .toEqualCaseInsensitive(`<div class="blog"><a href="img.html" target="_blank"><div class="blog"><img src="img.jpg" alt="img" class="blog" style="width:auto; height:100%"/></div></a></div>`);
  });

  it('parse list, single list', () => {
    expect(mdParser.parseMd(blog,`
- single
`))
      .toEqualCaseInsensitive(`<div class="blog"><ul><li>single</li></ul></div>`);
  });

  it('parse list, double list, non list', () => {
    expect(mdParser.parseMd(blog,`
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


  it('parse steps', () => {
    expect(mdParser.parseMd(blog,`
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
    expect(mdParser.parseMd(blog,`
Line one
Line Two

Line Three

`))
      .toEqualCaseInsensitive(`<div class="blog"><p>Line one
Line Two</p>
<p>Line Three</p></div>`);

  });

  it('parse blockquotes', () => {
    expect(mdParser.parseMd(blog, `
> block quote
`))
    .toEqualCaseInsensitive(`<div class="blog"><blockquote><p>block quote</p></blockquote></div>`);
  });

 it('parse arcordion', () => {
   expect(mdParser.parseMd(blog, `
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
