'use strict';

define(['jquery', 'bibtex', 'isbn'],
    function($, bibtex, isbn) {
        $("#isbn_button").click(function() {
            var isbn_input = $('#isbn_text').val();
            console.log(isbn_input);
            bibtex.executeQuery(isbn_input).then(function() {
                $('#bibtex_text').val(bibtex.getResult());
            });
        });

        $('#isbn_text').on('keyup change', function() {

            var isbnButton = $('#isbn_button');
            var isbnText = $('#isbn_text');
            var isIsbn = isbn.validate(isbnText.val());

            isbnButton.prop('disabled', !isIsbn);
            isbnButton.prop('class', isIsbn ? 'button_enabled' : 'button_disabled');
            isbnText.prop('class', isIsbn ? 'text_correct' : 'text_incorrect');
        });
    }
);
