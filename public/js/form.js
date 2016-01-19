'use strict';

define(['jquery', 'bibtex', 'isbn'],
    function($, bibtex, isbn) {

        $("#isbn_button").click(function() {
            executeQuery();
        });

        $('#isbn_text').on('keyup change', function(event) {
            if (event.keyCode == 13) {
                executeQuery();
            } else {
                setCss();
            }
        });

        function executeQuery() {
            setCss();
            var isbnText = $('#isbn_text').val();
            if (isbn.validate(isbnText)) {
                $('#isbn_button').css('cursor', 'progress');
                $(document.body).css('cursor', 'progress');
                bibtex.executeQuery(isbnText).then(function() {
                    var bibtexText = $('#bibtex_text');
                    bibtexText.val(bibtex.getResult());
                    bibtexText.focus();
                    $('#isbn_button').css('cursor', 'pointer');
                    $(document.body).css('cursor', 'auto');
                });
            }
        }



        function setCss() {
            var isbnButton = $('#isbn_button');
            var isbnTextElement = $('#isbn_text');
            var isIsbn = isbn.validate(isbnTextElement.val());

            isbnButton.prop('disabled', !isIsbn);
            isbnButton.prop('class', isIsbn ? 'button_enabled' : 'button_disabled');
            isbnTextElement.prop('class', isIsbn ? 'text_correct' : 'text_incorrect');
        }


    }
);
