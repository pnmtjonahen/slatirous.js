/* global describe, beforeEach, it, setImmediate, expect, jest */

'use strict';


import { IndexView } from './index.js';
import { toBeInTheDocument, toBeVisible } from '@testing-library/jest-dom'
import { mdParser } from './mdparser.js'

expect.extend({ toBeInTheDocument, toBeVisible })
jest.mock('./mdparser.js');


describe('Index', () => {
    beforeEach(() => {
        mdParser.parseMd.mockReset();
        window.scrollTo = jest.fn();
        fetch.resetMocks();
        window.location.href = '';
        document.body.innerHTML = `<div id="blog"></div>
<ul>
  <template id="older-post">
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
                id: 'id1',
                title: 'TEST BLOG',
                description: 'Test Blog',
                date: '1-4-2018',
                imageurl: 'https://www.w3schools.com/w3images/woods.jpg',
                imagealt: 'nature',
                tags:['js', 'test']
            }
          ]));
        fetch.mockResponseOnce('# Simple Text 1', { status: 200, headers: { 'content-type': 'text/plain; charset=UTF-8'} });
        const flushPromises = () => new Promise(setImmediate);
        new IndexView();
        await flushPromises();
        expect(window.location.href === 'http://localhost/#id1').toBeTrue();
        expect(document.getElementById('blog')).toBeInTheDocument();
    });
    it('should load index.js with accordion', async () => {

        fetch.mockResponseOnce(JSON.stringify([{
                id: 'id1',
                title: 'TEST BLOG',
                description: 'Test Blog',
                date: '1-4-2018',
                imageurl: 'https://www.w3schools.com/w3images/woods.jpg',
                imagealt: 'nature',
                tags:['js', 'test']
            }
          ]));
        fetch.mockResponseOnce('# Simple Text 1', { status: 200, headers: { 'content-type': 'text/plain; charset=UTF-8'} });
        mdParser.parseMd = jest.fn(() => {
          return `<div class="blog"><div id="panel" class="panel">Simple text</div><button class="accordion"></button></div>`;
        });
        const flushPromises = () => new Promise(setImmediate);
        new IndexView();
        await flushPromises();
        expect(window.location.href === 'http://localhost/#id1').toBeTrue();
        const accordion = document.getElementsByClassName("accordion");
        expect(document.getElementById("panel")).toBeVisible();
        expect(accordion[0].innerHTML).toEqualCaseInsensitive("More...");
        accordion[0].click();
        expect(document.getElementById("panel")).toBeVisible();
        expect(accordion[0].innerHTML).toEqualCaseInsensitive("Less...");
        accordion[0].click();
        expect(accordion[0].innerHTML).toEqualCaseInsensitive("More...");
        expect(document.getElementById("panel")).not.toBeVisible();
    });

    it('should load index.js switch to second', async () => {

        fetch.mockResponseOnce(JSON.stringify([{
                id: 'id1',
                title: 'TEST BLOG',
                description: 'Test Blog',
                date: '1-4-2018',
                imageurl: 'https://www.w3schools.com/w3images/woods.jpg',
                imagealt: 'nature',
                tags:['js', 'test']
            },
            {
                id: 'id2',
                title: 'TEST BLOG',
                description: 'Test Blog',
                date: '2-4-2018',
                imageurl: 'https://www.w3schools.com/w3images/woods.jpg',
                imagealt: 'nature'
            }
          ]));
        fetch.mockResponseOnce('# Simple Text 1', { status: 200, headers: { 'content-type': 'text/plain; charset=UTF-8'} });
        fetch.mockResponseOnce('# Simple Text 2', { status: 200, headers: { 'content-type': 'text/plain; charset=UTF-8'} });
        const flushPromises = () => new Promise(setImmediate);
        new IndexView();
        await flushPromises();
        expect(window.location.href === 'http://localhost/#id1').toBeTrue();
        document.getElementById('id2').click();
        await flushPromises();
        expect(window.location.href === 'http://localhost/#id2').toBeTrue();
        expect(document.getElementById('blog')).toBeInTheDocument();
    });

    it('should load second blog', async () => {
        window.location.href = '#id2';
        fetch.mockResponseOnce(JSON.stringify([{
                id: 'id1',
                title: 'TEST BLOG',
                description: 'Test Blog',
                date: '1-4-2018',
                imageurl: 'https://www.w3schools.com/w3images/woods.jpg',
                imagealt: 'nature',
                tags:['js', 'test']
            },
            {
                id: 'id2',
                title: 'TEST BLOG',
                description: 'Test Blog',
                date: '2-4-2018',
                imageurl: 'https://www.w3schools.com/w3images/woods.jpg',
                imagealt: 'nature'
            }
          ]));
        fetch.mockResponseOnce('# Simple Text 2', { status: 200, headers: { 'content-type': 'text/plain; charset=UTF-8'} });
        const flushPromises = () => new Promise(setImmediate);
        new IndexView();
        await flushPromises();
        expect(window.location.href === 'http://localhost/#id2').toBeTrue();

    });

    it('should fail to load blog', async () => {
        fetch.mockReject({
          status: 404,
          body: JSON.stringify("")
        });
        const flushPromises = () => new Promise(setImmediate);
        new IndexView();
        await flushPromises();
        const blog = document.getElementById('blog');
        expect(blog.childElementCount === 0).toBeTrue();
    });

    it('should fail to load entry ', async () => {
        fetch.mockResponseOnce(JSON.stringify([{
                id: 'id1',
                title: 'TEST BLOG',
                description: 'Test Blog',
                date: '1-4-2018',
                imageurl: 'https://www.w3schools.com/w3images/woods.jpg',
                imagealt: 'nature',
                tags:['js', 'test']
            }
          ]));
        fetch.mockReject({
          status: 404,
          body: JSON.stringify("")
        });
        const flushPromises = () => new Promise(setImmediate);
        new IndexView();
        await flushPromises();
        const blog = document.getElementById('blog');
        expect(blog.childElementCount === 1).toBeTrue();
    });
    it('should fail to load entry, wrong bookmark ', async () => {
        window.location.href = '#id2';
        fetch.mockResponseOnce(JSON.stringify([{
                id: 'id1',
                title: 'TEST BLOG',
                description: 'Test Blog',
                date: '1-4-2018',
                imageurl: 'https://www.w3schools.com/w3images/woods.jpg',
                imagealt: 'nature',
                tags:['js', 'test']
            }
          ]));
        fetch.mockResponseOnce('# Simple Text 2', { status: 200, headers: { 'content-type': 'text/plain; charset=UTF-8'} });
        const flushPromises = () => new Promise(setImmediate);
        new IndexView();
        await flushPromises();
        const blog = document.getElementById('blog');
        expect(blog.childElementCount === 1).toBeTrue();
        expect(window.location.href === 'http://localhost/#id1').toBeTrue();
    });
});
