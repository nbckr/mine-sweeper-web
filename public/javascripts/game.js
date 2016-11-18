var gridData;
var stateData;

var $grid;

// on load
$(function () {

    console.log("Page loaded");

    update();

//    update();    // will generate grid at first call


});

function update() {
    $.ajax({
        url: 'game/json',
        dataType: 'json',
        type: 'GET',
        success: function (response) {
            gridData = response.grid;
            stateData = response.state;

            if (!$grid || $grid.children().length == 0) {
                generateGrid();
            }
        },
        error: function () {
            console.log('error');
        }
    });
}

function generateGrid() {

    $grid = $('#grid');

    gridData.forEach(function (row) {
        console.log(row);

        var $row = $('<div class="row">');

        row.forEach(function(cell) {

            console.log(cell)
            var $cell = $('<div />', {
                id: cell.position.row + ',' + cell.position.col,
                class: "cell",
                //text: "CELL",
                'data-row': cell.position.row,
                'data-col': cell.position.col,
                click: function (e) {
                    e.preventDefault();
                    console.log($(this))
                }
            });

            // revealed
            if (cell.isRevealed && !cell.hasMine) {
                $cell.text(cell.surroundingMines);
            }
            else if (cell.isRevealed && cell.hasMine) {
                $cell.text('M').addClass('mine');
            }

            // hidden
            else if (cell.isFlagged) {
                $cell.text('F').addClass('flagged');
            }
            else {
                $cell.text('X').removeClass('flagged');
            }

            $row.append($cell);
        });
        $grid.append($row);
    });

}


$(function () {

    $('#update-button').on('click', function () {
        console.log("UPDATE!");
        $.ajax({
            url: 'json',
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                console.log('success');
                $('#json-input:first').text(data);
            },
            error: function () {
                console.log('error');
            }

        })
    });

});
