'use strict';

console.log('hello');

require.config({
    baseUrl: '/js',
    paths: {
        jquery: 'lib/jquery'
    }
});

require(['form']);

require(['bibtex', 'isbn'],
    function   (bibtex, isbn) {
        console.log(isbn.validate('0-9752298-0-x'));
    }
);


