'use strict';

define(
    function() {
        function validate10(isbn) {
            if (isbn.length != 10) {
                return false;
            }
            var sum = 0;
            for (var i = 0; i < isbn.length; i++) {
                if (isbn[i].match(/X|[0-9]/) != null) {
                    var value = isbn[i] == 'X' ? 10 : parseInt(isbn[i]);
                    sum += (10 - i) * value;
                } else {
                    return false;
                }
            }
            return (sum % 11) == 0
        }

        function validate13(isbn) {
            if (isbn.length != 13) {
                return false;
            }
            var sum = 0;
            for (var i = 0; i < isbn.length; i++) {
                if (isbn[i].match(/[0-9]/) != null) {
                    sum += (((i % 2)==0) ? 1 : 3) * parseInt(isbn[i]);
                } else {
                    return false;
                }
            }
            return (sum % 10) == 0
        }

        function validate(isbn) {
            isbn = isbn.toUpperCase().replace(/-/g, '').split('');
            return validate10(isbn) || validate13(isbn);
        }

        return {
            validate: validate
        }
    }
);


