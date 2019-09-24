/* global fetch */

'use strict';

var expect = require('chai').expect;

describe('Index', () => {
    beforeEach(() => {
        fetch.resetMocks();
        document.body.innerHTML = `<div id="blog"/>
<ul class="w3-ul w3-hoverable w3-white">
  <template id="popular-post">
    <li class="w3-padding-16" >
        <a href="#{id}" onclick="view.setCurrentBlog('{id}'); document.body.scrollTop = 0; document.documentElement.scrollTop = 0;" class="blog">
          <img src="{imageurl}" alt="{imagealt}" class="w3-left w3-margin-right" style="width:50px">
          <span class="w3-large">{title}</span><br>
          <span>{description}</span>
        </a>
    </li>
  </template>
</ul>`;
    });
    it('should load index.js', () => {
        fetch.mockResponseOnce(JSON.stringify([{
                id: "id1",
                title: "TEST BLOG",
                description: "Test Blog",
                date: "1-4-2018",
                imageurl: "https://www.w3schools.com/w3images/woods.jpg",
                imagealt: "nature",
                entry: "Test blog entry"
            },
            {
                id: "id2",
                title: "TEST BLOG2",
                description: "Multi paragraph test blog",
                date: "20-3-2018",
                imageurl: "https://www.w3schools.com/w3images/bridge.jpg",
                imagealt: "bridge",
                entry: [
                    "Line 1",
                    "Line 2"
                ]
            },
            {
                id: "id3",
                title: "TEST BLOG2",
                description: "Multi paragraph test blog",
                date: "20-3-2018",
                imageurl: "https://www.w3schools.com/w3images/bridge.jpg",
                imagealt: "bridge",
                entry: [
                    "# Header1",
                    "## Header 2",
                    "### Header 3",
                    "![test](http://image.png)",
                    "simple line"
                ]
            }
          ]));
        var index = require('./index.js');
        expect(index !== undefined);
    });
});
