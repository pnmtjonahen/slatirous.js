/* global fetch */

'use strict';

import {expect} from 'chai';
import {IndexView} from './index.js';

describe('Index', () => {
    beforeEach(() => {
        fetch.resetMocks();
        document.body.innerHTML = `<div id="blog"></div>
<ul>
  <template id="popular-post">
    <li>
        <a href="#{id}" id="{id}">
          <img src="{imageurl}" alt="{imagealt}">
          <span>{title}</span><br>
          <span>{description}</span>
        </a>
    </li>
  </template>
</ul>
<div id="tags"></div>`;
    });

    it('should load index.js', async () => {
        fetch.mockResponseOnce(JSON.stringify([{
                id: "id1",
                title: "TEST BLOG",
                description: "Test Blog",
                date: "1-4-2018",
                imageurl: "https://www.w3schools.com/w3images/woods.jpg",
                imagealt: "nature",
                tags:["js", "test"]
            },
            {
                id: "id2",
                title: "TEST BLOG",
                description: "Test Blog",
                date: "2-4-2018",
                imageurl: "https://www.w3schools.com/w3images/woods.jpg",
                imagealt: "nature"
            }
          ]));
        fetch.mockResponseOnce('# Simple Text 1', { status: 200, headers: { 'content-type': 'text/plain; charset=UTF-8'} });
        fetch.mockResponseOnce('# Simple Text 2', { status: 200, headers: { 'content-type': 'text/plain; charset=UTF-8'} });
        const flushPromises = () => new Promise(setImmediate);
        const index = new IndexView();
        await flushPromises();
        expect(index !== undefined);
        index.setBlog(index.blogs[1]);
    });
});
