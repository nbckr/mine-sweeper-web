var gridData;
var stateData;

var $grid;

// TODO Mark Button "Neues Spiel" -> Dialogfenster mit Nachfrage -> neues Spiel
// TODO Mark Spielfeld schicker machen vom Design


$(function () {

    $('#start-button').on('click', function () {
        makeAjaxCall('POST', 'restart');
        updateGrid();
        resetClasses();
    });

    // Prevent context menu
    $('body').on('contextmenu', function () {
        return false;
    });

    update();
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
            } else {
                updateGrid();
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

        var $row = $('<div class="row">');

        row.forEach(function(cell) {
            var $cell = $('<div />', {
                id: cell.position.row + ',' + cell.position.col,
                class: 'cell hvr-grow',
                'data-row': cell.position.row,
                'data-col': cell.position.col,
                click: null
            });

            $cell.on('mousedown', function (e) {
                if (e.button === 0) {
                    makeAjaxCall('POST', 'reveal', cell.position.row, cell.position.col);
                }
                if (e.button === 2) {
                    makeAjaxCall('POST', 'flag', cell.position.row, cell.position.col);
                }
            });

            updateCell($cell, cell);

            $row.append($cell);
        });
        $grid.append($row);
    });
}

function updateGrid() {

    $grid.children().children().each(function () {
        var targetCell = $(this);
        var row = targetCell.attr('data-row');
        var col = targetCell.attr('data-col');
        var cell = gridData[row][col];
        updateCell(targetCell, cell);
    })
}

function updateCell($targetCell, cellData) {

    if (cellData.isRevealed) {
        $targetCell.text(cellData.surroundingMines).removeClass('flagged').addClass('revealed');

        if (cellData.hasMine) {
            $targetCell.text('').addClass('mine fa fa-bomb');
            $grid.add('#game').addClass('gameover');
        }
    }

    // hidden
    else if (cellData.isFlagged) {
        $targetCell.text('F').addClass('flagged');
    }
    else {
        $targetCell.text('').removeClass('flagged');
    }
}

function makeAjaxCall(type, action, row, col) {
    $.ajax({
        type: type,
        url: 'game/json',
        data: JSON.stringify({
            action: action,
            row: row || 0,
            col: col || 0
        }),
        complete: update,
        contentType: 'application/json'
    });
}

function resetClasses() {
    $grid.add('#game').removeClass('gameover');
    $grid.children().children().removeClass('revealed flagged mine fa fa-bomb');
}