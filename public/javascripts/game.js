var gridData;
var stateData;

var size = "medium";
var difficulty = "intermediate";

var $grid;
var $nav;
var explosionSound;
var $wsLog;
var webSocket;


$(function () {

    setGlobalVariables();

    connectToWebSocket();

    $('#start-btn').on('click', function () {

        // store chosen values in global vars
        size = $('input[name=size]').filter(':checked').val();
        difficulty = $('input[name=difficulty]').filter(':checked').val();

        // animate and start
        $grid.addClass('zoomOutRight');
        setTimeout(startGame, 1000);
    });

    // Prevent context menu
    $('body').on('contextmenu', function () {
        return false;
    });
});

function connectToWebSocket() {

    webSocket = new WebSocket("ws://localhost:9000/socket");
    logWebSocketConnection('Socket Status: ' + webSocket.readyState + ' (ready)');

    webSocket.onopen = function () {
        logWebSocketConnection('Socket Status: ' + webSocket.readyState + ' (open)');
        startGame();
    };

    webSocket.onmessage = function (message) {
        var messageAsJson = JSON.parse(message.data);
        updateData(messageAsJson);
    };

    webSocket.onclose = function () {
        logWebSocketConnection('Socket Status: ' + webSocket.readyState + ' (Closed)');
    };

    webSocket.onerror = function (err) {
        logWebSocketConnection('Socket Error: ' + err);
    }
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

    if (stateData === 'NEW_GAME' || !$grid || $grid.children().length == 0) {
        console.log($grid);
        generateGrid();
    } else {
        updateGrid();
    }
}

function generateGrid() {

    resetClasses();

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

    if (cellData.hasMine) {
        $targetCell.addClass('danger');
    }

    if (cellData.isRevealed) {
        $targetCell.text(cellData.surroundingMines).removeClass('flagged fa fa-flag').addClass('revealed surrounding-' + cellData.surroundingMines);

        // GAME OVER
        if (cellData.hasMine) {
            gameOver($targetCell);
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
    $grid.empty();
    $grid.removeClass('zoomOutRight').addClass('zoomInLeft');
    removeClassAfter($grid, 'zoomInLeft', 1000);
    $grid.add('#body-wrapper').add($nav).removeClass('gameover');
}

function startGame() {

    if ($nav.hasClass('gameover')) {
        $nav.addClass('slideInDown');
        removeClassAfter($nav, 'slideInDown', 1000);
    }

    sendStringToWebSocket({
        action: 'start',
        size: size,
        difficulty: difficulty
    });
}

function gameOver(triggerCell) {
    playExplosionSound();
    explodePage(triggerCell);
    // disable further moves
    $('.cell').off();
}

function setGlobalVariables() {
    $grid = $('#grid');
    $nav = $('.navbar');
    explosionSound = $('#explosion-sound').get(0);
    $wsLog = $('#wsLog');
}

function removeClassAfter($target, classname, milliseconds) {
    setTimeout(function() {
        $target.removeClass(classname);
    }, milliseconds);
}

function explodePage(triggerCell) {
    triggerCell.text('').removeClass('fa-flag').addClass('mine vibrate fa fa-bomb');
    $grid.add('#body-wrapper').add($nav).addClass('gameover');
    $grid.children().children('.danger').not('.revealed').addClass('revealed mine fa fa-bomb');
    $grid.children().children().not('.revealed').addClass('falling');
}

function playExplosionSound() {
    explosionSound.currentTime = 1.66;
    explosionSound.play();
}