var gridData;
var stateData;

var size = "medium";
var difficulty = "intermediate";
var devMode = false;

var $grid;
var $nav;
var $wsLog;
var webSocket;

// default values
var animationTime = 1000;


$(function () {
    setGlobalVariables();

    connectToWebSocket();

    // Start new game from the modal
    $('#start-button').on('click', function () {
        // store chosen values in global vars
        size = $('input[name=size]').filter(':checked').val();
        difficulty = $('input[name=difficulty]').filter(':checked').val();

        // animate and start
        $grid.addClass('zoomOutRight');
        setTimeout(startGame, animationTime);
    });

    // Activate dev mode
    $('#settings-button').on('click', function () {
        devMode = !devMode;
        if (devMode) {
            $('.danger').addClass('mine');
            $wsLog.fadeIn(animationTime);
        } else {
            $('.danger').not('.revealed').removeClass('mine');
            $wsLog.fadeOut(animationTime);
        }
    });

    // Prevent context menu
    $('body').on('contextmenu', function () {
        return false;
    });
});

function connectToWebSocket() {
    webSocket = new WebSocket("ws://minesweeper-htwg.herokuapp.com/socket");
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
        generateGrid();
    } else {
        updateGrid();
    }

    if (stateData === 'GAME_LOST') {
        gameOver();
    }

    if (stateData === 'GAME_WON') {
        gameWon();
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
            $targetCell.text('').removeClass('fa-flag').addClass('mine vibrate fa fa-bomb');
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
    removeClassAfter($grid, 'zoomInLeft', animationTime);
    $grid.add('#body-wrapper').add($nav).removeClass('gameover gamewon');
    devMode = false;
}

function startGame() {
    if ($nav.hasClass('gameover')) {
        $nav.addClass('slideInDown');
        removeClassAfter($nav, 'slideInDown', animationTime);
    }

    sendStringToWebSocket({
        action: 'start',
        size: size,
        difficulty: difficulty
    });
}

function gameOver() {
    playExplosionSound();
    explodePage();
    disableGrid();
}

function gameWon() {
    playTadaSound();
    celebratePage();
    disableGrid();
}

function disableGrid() {
    // disable further moves
    $('.cell').off();
}

function setGlobalVariables() {
    $grid = $('#grid');
    $nav = $('.navbar');
    $wsLog = $('#wsLog');
}

function removeClassAfter($target, classname, milliseconds) {
    setTimeout(function() {
        $target.removeClass(classname);
    }, milliseconds);
}

function explodePage() {
    $grid.add('#body-wrapper').add($nav).addClass('gameover');
    $grid.children().children('.danger').not('.revealed').addClass('revealed mine fa fa-bomb');
    $grid.children().children().not('.revealed').addClass('falling');
}
function celebratePage() {
    $grid.add('#body-wrapper').add($nav).addClass('gamewon');
    $('.danger').addClass('fa fa-bomb falling');
}

function playExplosionSound() {
    explosionSound = $('#explosion-sound').get(0);
    explosionSound.currentTime = 1.66;
    explosionSound.play();
}

function playTadaSound() {
    tadaSound = $('#tada-sound').get(0);
    //tadaSound.currentTime = 0;
    tadaSound.play();
}