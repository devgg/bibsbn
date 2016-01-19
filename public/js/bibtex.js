'use strict';

define(['jquery'],
    function($) {

        var authorJoinString = ' and ';
        var publisherJoinString = ' and ';


        function requestInfo(apis) {
            var deferreds = apis.map(function(api, position) {
                return $.ajax(api.url(), api.ajaxSettings(position));
            });

            return $.when.apply($.ajax, deferreds);
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
                numberResults++;
                console.log('error occured');
            }
        };

        function Api(name, url, ajaxSettings) {
            this.name = name;
            this.url = url;
            this.ajaxSettings = ajaxSettings;
        }

        function join(array, joinString, targetProperty) {
            this[targetProperty] = array.join(joinString);
        }

        function mapToPropertyAndJoin(array, property, joinString, targetProperty) {
            this[targetProperty] = array.map(function (element) {
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
            if (object.hasOwnProperty(property)) {
                func();
            }
        }

        function handleResult(bibtexEntries, position) {
            numberResults++;
            resultEntries[position] = bibtexEntries;
            if (numberResults == apis.length) {
                resultEntries = [].concat.apply([], resultEntries);
                console.log(resultEntries);
                console.log(mergeResultArrays());
                result = objectToBibtex(mergeResultArrays());
            }
        }

        function mergeResultArrays() {
            return resultEntries.reduce(function (entry1, entry2) {
                for (var property in entry1) {
                    entry2[property] = entry1[property];
                }
                return entry2;
            }, {});
        }

        function objectToBibtex(object) {
            var bibtex = '@book{' + currentIsbn.replace(/\s/g, '') + ',\n';
            for (var property in object) {
                bibtex += '\t' + property + ' = ' + '{' + object[property] + '},\n';
            }
            bibtex += '\tisbn = {' + currentIsbn + '}';
            return bibtex + '\n}';
        }


        var googleApi = new Api(
            'Google Books',
            function() {
                return 'https://www.googleapis.com/books/v1/volumes';
            },
            function (position) {
                return new AjaxSettings({
                    data: {
                        q: 'isbn:' + currentIsbn
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
                                callFunctionIfPresent(book, 'publisher', publisher);
                                callFunctionIfPresent(book, 'publishedDate', year);

                                bibtexEntries.push(bibtexEntry);
                            }, this);
                        }
                        $('#status_google').prop('class', 'status_ready');
                        handleResult(bibtexEntries, position);
                    }
                })
            }
        );

        var openLibraryApi = new Api(
            'Open Library',
            function() {
                return 'https://openlibrary.org/api/books';
            },
            function (position) {
                return new AjaxSettings({
                    data: {
                        format: 'javascript',
                        jscmd: 'data',
                        bibkeys: 'ISBN:' + currentIsbn
                    },
                    jsonp: "callback",
                    dataType: "jsonp",

                    success: function (response) {
                        var bibtexEntries = [];
                        if (response.hasOwnProperty('ISBN:' + currentIsbn)) {
                            var book = response['ISBN:' + currentIsbn];
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
                        $('#status_open_library').prop('class', 'status_ready');
                        handleResult(bibtexEntries, position);
                    }
                })
            }
        );


        var worldcatApi = new Api(
            'WorldCat',
            function() {
                return 'http://xisbn.worldcat.org/webservices/xid/isbn/' + currentIsbn;
            },
            function (position) {
                return new AjaxSettings({
                    data: {
                        method: 'getMetadata',
                        format: 'json',
                        fl: '*'
                    },
                    jsonp: "callback",
                    dataType: "jsonp",

                    success: function (response) {
                        console.log(response);
                        var bibtexEntries = [];
                        if (response.hasOwnProperty('list')) {
                            response.list.forEach(function (book) {

                                var bibtexEntry = {};
                                var author = getProperty.bind(bibtexEntry, book.author, 'author');
                                var title = getProperty.bind(bibtexEntry, book.title, 'title');
                                var publisher = getProperty.bind(bibtexEntry, book.publisher, 'publisher');
                                var year = convertToDate.bind(bibtexEntry, book.year, 'year');
                                var address = getProperty.bind(bibtexEntry, book.city, 'address');
                                var edition = getProperty.bind(bibtexEntry, book.ed, 'edition');

                                callFunctionIfPresent(book, 'author', author);
                                callFunctionIfPresent(book, 'title', title);
                                callFunctionIfPresent(book, 'publisher', publisher);
                                callFunctionIfPresent(book, 'year', year);
                                callFunctionIfPresent(book, 'city', address);
                                callFunctionIfPresent(book, 'ed', edition);
                                bibtexEntries.push(bibtexEntry);
                            }, this);
                        }
                        $('#status_worldcat').prop('class', 'status_ready');
                        handleResult(bibtexEntries, position);
                    }
                })
            }
        );


        var apis = [googleApi, openLibraryApi, worldcatApi];

        var currentIsbn;
        var numberResults;
        var resultEntries;
        var result;


        function executeQuery(isbn) {
            currentIsbn = isbn;
            numberResults = 0;
            resultEntries = new Array(apis.length);
            return requestInfo(apis);
        }

        function getResult() {
            return result;
        }


        return {
            executeQuery: executeQuery,
            getResult: getResult
        };
    }
);


/*
 @book{3809434469,
 ,
 isbn = {3809434469}
 }*/