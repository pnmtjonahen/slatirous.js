/* global fetch */

'use strict';

var expect = require('chai').expect;

describe('Index', () => {
    beforeEach(() => {
        fetch.resetMocks();
        document.body.innerHTML = '<div id="blog"/>'
                + '<div id="popular-post">'
                + '<li class="w3-padding-16" >'
                + '<img src="{imageurl}" alt="{imagealt}" class="w3-left w3-margin-right" style="width:50px">'
                + '<span class="w3-large">{title}</span><br>'
                + '<span>Fixed text node</span>'
                + '</li></div>';
    });
    it('should load index.js', () => {
        fetch.mockResponseOnce(JSON.stringify([{
                title: "TEST BLOG",
                description: "Test Blog",
                date: "1-4-2018",
                imageurl: "https://www.w3schools.com/w3images/woods.jpg",
                imagealt: "nature",
                entry: "Test blog entry"
            },
            {
                title: "TEST BLOG2",
                description: "Multi paragraph test blog",
                date: "20-3-2018",
                imageurl: "https://www.w3schools.com/w3images/bridge.jpg",
                imagealt: "bridge",
                entry: [
                    "Line 1",
                    "Line 2"
                ]
            }]));
        var index = require('./index.js');
        expect(index !== undefined);
        
    });
});