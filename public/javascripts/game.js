var gridData;
var stateData;

var $grid;
var $nav;



$(function () {

    setGlobalVariables();

    $('#start-button').on('click', function () {

        $grid.addClass('zoomOutRight');
        setTimeout(restartGame, 1000);

        //$grid.addClass('zoomInLeft');
        //$grid.removeClass('zoomOutRight zoomInLeft');

    });

    $('#settings-button').on('click', function () {

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

    gridData.forEach(function (row) {

        var $row = $('<div class="row">');

        row.forEach(function(cell) {
            var $cell = $('<div />', {
                id: cell.position.row + ',' + cell.position.col,
                class: 'cell hvr-grow',
                'data-row': cell.position.row,
                'data-col': cell.position.col
            });

            $cell.on('mousedown', function (e) {

                if (e.button === 0) {
                    makeAjaxCall('POST', 'reveal', cell.position.row, cell.position.col);
                }
                //if (e.button === 2) {
                else {
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
        $targetCell.text(cellData.surroundingMines).removeClass('flagged fa fa-flag').addClass('revealed surrounding-' + cellData.surroundingMines);

        if (cellData.hasMine) {
            $targetCell.text('').removeClass('fa-flag').addClass('mine fa fa-bomb');
            $grid.add('#body-wrapper').add($nav).addClass('gameover');
            $grid.children().children().not('.revealed').addClass('falling');
        }
    }

    // hidden
    else if (cellData.isFlagged) {
        $targetCell.text('').addClass('flagged fa fa-flag');
    }
    else {
        $targetCell.text('').removeClass('flagged fa-flag');
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
    $grid.add('#body-wrapper').add($nav).removeClass('gameover');
    $grid.children().children().removeClass('revealed flagged mine surrounding-0 surrounding-1 surrounding-2 surrounding-3 surrounding-4 surrounding-5 surrounding-6 surrounding-7 surrounding-8 fa fa-bomb fa-flag falling');
}

function restartGame() {

    if ($nav.hasClass('gameover')) {
        $nav.addClass('slideInDown');
        removeClassAfter($nav, 'slideInDown', 1000);
    }

    makeAjaxCall('POST', 'restart');
    updateGrid();
    resetClasses();
    $grid.removeClass('zoomOutRight').addClass('zoomInLeft');
}

function setGlobalVariables() {
    $grid = $('#grid');
    $nav = $('.navbar');
}

function removeClassAfter($target, classname, milliseconds) {
    setTimeout($target.removeClass.bind(null, classname), milliseconds);
}