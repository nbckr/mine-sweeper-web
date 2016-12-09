var gridData;
var stateData;

var $grid;
var $nav;
var explosionSound;
var $wsLog;
var webSocket;


$(function () {

    setGlobalVariables();

    connectToWebSocket(restartGame);

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
});

function connectToWebSocket(callbackAfterOpen) {

    webSocket = new WebSocket("ws://localhost:9000/socket");
    logWebSocketConnection('Socket Status: ' + webSocket.readyState + ' (ready)');

    webSocket.onopen = function () {
        logWebSocketConnection('Socket Status: ' + webSocket.readyState + ' (open)');
        restartGame();
    };

    webSocket.onmessage = function (message) {

        var messageAsJson = JSON.parse(message.data);
        updateData(messageAsJson);
    };

    webSocket.onclose = function () {
        logWebSocketConnection('Socket Status: ' + webSocket.readyState + ' (Closed)');
    };
}

function logWebSocketConnection(message) {
    $wsLog.append('<p>' + message + '</p>');
}

function sendStringToWebSocket(messageObject) {
    logWebSocketConnection('Going to send message to server');
    webSocket.send(JSON.stringify(messageObject));
    logWebSocketConnection('Sent message to server');
}


function updateData(messageAsJson) {

    gridData = messageAsJson.grid;
    stateData = messageAsJson.state;

    if (!$grid || $grid.children().length == 0) {
        generateGrid();
    } else {
        updateGrid();
    }

    if (stateData === 'NEW_GAME') {
        resetClasses();
    }
}

function generateGrid() {

    gridData.forEach(function (row) {

        var $row = $('<div class="row">');

        row.forEach(function (cell) {
            var $cell = $('<div />', {
                id: cell.position.row + ',' + cell.position.col,
                class: 'cell hvr-grow',
                'data-row': cell.position.row,
                'data-col': cell.position.col
            });

            $cell.on('mousedown', function (e) {

                if (e.button === 0) {
                    sendStringToWebSocket({
                        action: 'reveal',
                        row: cell.position.row,
                        col: cell.position.col
                    });
                }
                //if (e.button === 2) {
                else {
                    sendStringToWebSocket({
                        action: 'flag',
                        row: cell.position.row,
                        col: cell.position.col
                    });
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

        // GAME OVER
        if (cellData.hasMine) {
            playExplosionSound();
            explodePage($targetCell);
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

function resetClasses() {
    $grid.removeClass('zoomOutRight').addClass('zoomInLeft');
    $grid.add('#body-wrapper').add($nav).removeClass('gameover');
    $grid.children().children().removeClass('revealed flagged mine surrounding-0 surrounding-1 surrounding-2 surrounding-3 surrounding-4 surrounding-5 surrounding-6 surrounding-7 surrounding-8 fa fa-bomb fa-flag falling');
}

function restartGame() {

    if ($nav.hasClass('gameover')) {
        $nav.addClass('slideInDown');
        removeClassAfter($nav, 'slideInDown', 1000);
    }

    sendStringToWebSocket({
        action: 'restart',
        row: null,
        col: null
    });

    resetClasses();
    // TODO warum hier? $grid.removeClass('zoomOutRight').addClass('zoomInLeft');
}

function setGlobalVariables() {
    $grid = $('#grid');
    $nav = $('.navbar');
    explosionSound = $('#explosion-sound').get(0);
    $wsLog = $('#wsLog');
}

function removeClassAfter($target, classname, milliseconds) {
    setTimeout($target.removeClass.bind(null, classname), milliseconds);
}

function explodePage(mineCell) {
    mineCell.text('').removeClass('fa-flag').addClass('mine fa fa-bomb');
    $grid.add('#body-wrapper').add($nav).addClass('gameover');
    $grid.children().children().not('.revealed').addClass('falling');
}

function playExplosionSound() {
    explosionSound.currentTime = 1.66;
    explosionSound.play();
}