'use strict';

var authorJoinString = ' and ';
var publisherJoinString = ' and ';


function requestInfo(api, isbn, position) {
    $.ajax(api.url, api.ajaxSettings(isbn, position));
}

function AjaxSettings(settings) {
    for (var setting in settings) {
        if (settings.hasOwnProperty(setting)) {
            this[setting] = settings[setting];
        }
    }
}

AjaxSettings.prototype = {
    constructor: AjaxSettings,
    error: function () {
        console.log('error occured');
    }
};

function Api(name, url, ajaxSettings) {
    this.name = name;
    this.url = url;
    this.ajaxSettings = ajaxSettings;
}

function join(array, joinString, targetProperty) {
    this[targetProperty] =  array.join(joinString);
}

function mapToPropertyAndJoin(array, property, joinString, targetProperty) {
    this[targetProperty] =  array.map(function (element) {
        return element[property];
    }).join(joinString);
}

function getProperty(source, targetProperty) {
    this[targetProperty] = source;
}

function convertToDate(source, targetProperty) {
    this[targetProperty] = new Date(source).getFullYear();
}

function callFunctionIfPresent(object, property, func) {
    if(object.hasOwnProperty(property)) {
        func();
    }
}


var openLibraryApi = new Api(
    'Open Library',
    'https://openlibrary.org/api/books',
    function(isbn, position) {
        return new AjaxSettings({
            data: {
                format: 'javascript',
                jscmd: 'data',
                bibkeys: 'ISBN:' + isbn
            },
            jsonp: "callback",
            dataType: "jsonp",

            success: function (response) {
                var bibtexEntries = [];
                if (response.hasOwnProperty('ISBN:' + isbn)) {
                    var book = response['ISBN:' + isbn];
                    var bibtexEntry = {};

                    var author = mapToPropertyAndJoin.bind(bibtexEntry, book.authors, 'name', authorJoinString, 'author');
                    var title = getProperty.bind(bibtexEntry, book.title, 'title');
                    var publisher = mapToPropertyAndJoin.bind(bibtexEntry, book.publishers, 'name', publisherJoinString, 'publisher');
                    var year = convertToDate.bind(bibtexEntry, book.publish_date, 'year');

                    callFunctionIfPresent(book, 'authors', author);
                    callFunctionIfPresent(book, 'title', title);
                    callFunctionIfPresent(book, 'publishers', publisher);
                    callFunctionIfPresent(book, 'publish_date', year);
                    bibtexEntries.push(bibtexEntry);
                }
                handleResult(bibtexEntries, position);
            }
        })
    }
);


var googleApi = new Api(
    'Google Books',
    'https://www.googleapis.com/books/v1/volumes',
    function(isbn, position) {
        return new AjaxSettings({
            data: {
                q: 'isbn:' + isbn
            },

            success: function (response) {
                var bibtexEntries = [];
                if (response.hasOwnProperty('items')) {
                    response.items.forEach(function (book) {
                        book = book.volumeInfo;

                        var bibtexEntry = {};
                        var author = join.bind(bibtexEntry, book.authors, authorJoinString, 'author');
                        var title = getProperty.bind(bibtexEntry, book.title, 'title');
                        var publisher = getProperty.bind(bibtexEntry, book.publisher, 'publisher');
                        var year = convertToDate.bind(bibtexEntry, book.publishedDate, 'year');

                        callFunctionIfPresent(book, 'authors', author);
                        callFunctionIfPresent(book, 'title', title);
                        callFunctionIfPresent(book, 'publishers', publisher);
                        callFunctionIfPresent(book, 'publishedDate', year);

                        bibtexEntries.push(bibtexEntry);
                    }, this);
                }
                handleResult(bibtexEntries, position);
            }
        })
    }
);



var apis = [googleApi, openLibraryApi];
var isbn = '3625171570';

apis.forEach(function(api, index) {
    requestInfo(api, isbn, index);
});

var numberResults = 0;
var resultEntries = new Array(apis.length);

function handleResult(bibtexEntries, position) {
    console.log(position);
    console.log(bibtexEntries);
    numberResults++;
    resultEntries[position] = bibtexEntries;
    if (numberResults == apis.length) {
        resultEntries = [].concat.apply([], resultEntries);
        console.log(mergeResultArrays());
    }
}

function mergeResultArrays() {
    return resultEntries.reduce(function(entry1, entry2) {
        for (var property in entry1) {
            entry2[property] = entry1[property];
        }
        return entry2;
    }, {});
}