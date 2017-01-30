var gridData;
var stateData;

var size = "small";
var difficulty = "beginner";
var devMode = false;
var muteSound = false;

var $bodywrapper;
var $grid;
var $nav;
var $wsLog;
var $profile;
var webSocket;


// default values
var animationTime = 1000;
var longPressTime = 500;

var windowsWidth = $(window).width();
var isMobile = false;
var device = "";

// device detection
if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) isMobile = true;

$(function () {
    setGlobalVariables();

    connectToWebSocket();

    // Make alerts closeable
    $("[data-hide]").on("click", function () {
        $("." + $(this).attr("data-hide")).slideUp();
    });

    if (isMobile && (windowsWidth < 680)) {
        device = "phone"
    }
    if (isMobile && (windowsWidth >= 680)) {
        device = "tablet"
    }

    $('#show-modal').on('click', function () {
        if (device === "phone") {
            $('#choose-size').hide();
            $("#mobileMessage").show();
        }
        if (device === "tablet") {
            $('#select-sizse-large').hide();
            $("#mobileMessage").show();
        }
    });
    // Start new game from the modal
    $('#start-button').on('click', function () {
        // store chosen values in global vars
        size = "";
        if (device === "phone") {
            size = "small";
        }
        else {
            size = $('input[name=size]').filter(':checked').val();
        }
        difficulty = $('input[name=difficulty]').filter(':checked').val();

        // animate and start
        $grid.addClass('zoomOutRight');
        setTimeout(startGame, animationTime);
    });

    // Toggle dev mode
    var $settingsDevMode = $('#settings-devmode').first();
    $settingsDevMode.on('click', function () {
        toggleDevMode();
    });

    // Toggle sound
    var $settingsSound = $('#soundSettings').first();
    $settingsSound.on('click', function () {
        toggleSoundOption();
    });

    function toggleDevMode() {
        devMode = !devMode;
        if (devMode) {
            $('.danger').addClass('mine');
            //$settingsDevMode.children('.text').text(' Disable Dev Mode');
            $("#settings-devmode-enabled").show();
            $("#settings-devmode-disabled").hide();
            $wsLog.fadeIn(animationTime);
        } else {
            $('.danger').not('.revealed').removeClass('mine');
            $wsLog.fadeOut(animationTime);
            //$settingsDevMode.children('.text').text(' Enable Dev Mode');
            $("#settings-devmode-enabled").hide();
            $("#settings-devmode-disabled").show();
        }
    }

    function toggleSoundOption() {
        muteSound = !muteSound;
        if (muteSound) {
            $('audio').each(function () {
                this.muted = true;
            });

            $("#settings-sound-enabled").hide();
            $("#settings-sound-disabled").show();

        } else {
            $('audio').each(function () {
                this.muted = false;
            });

            $("#settings-sound-disabled").hide();
            $("#settings-sound-enabled").show();
        }
    }

    // Prevent context menu
    $('body').on('contextmenu', function () {
        return false;
    });
});

function connectToWebSocket() {
    var baseUrl = window.location.host;
    var port = location.port;

    // This is quite hacky - get the user id from a hidden HTML element that Play has rendered after login
    var userId = $('#userId').text();

    // localhost
    if (port === "9000") {
        webSocket = new WebSocket("ws:" + baseUrl + "/socket/" + userId);
    }
    // Heroku environment
    else {
        webSocket = new WebSocket("wss:" + baseUrl + "/socket/" + userId);
    }

    logWebSocketConnection('Socket Status: ' + webSocket.readyState + ' (ready)');

    webSocket.onopen = function () {
        logWebSocketConnection('Socket Status: ' + webSocket.readyState + ' (open)');

        // Trigger new game or current game as soon as socket is open
        sendStringToWebSocket({action: 'touch'});
    };

    webSocket.onmessage = function (message) {
        // We send pings periodically to keep WebSocket alive.
        if (message.data === 'ping') return;

        var messageAsJson = JSON.parse(message.data);
        updateData(messageAsJson);
    };

    webSocket.onclose = function () {
        logWebSocketConnection('Socket Status: ' + webSocket.readyState + ' (Closed)');
    };

    webSocket.onerror = function (err) {
        alert('Error with WebSockets. Please try again shortly.');
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

            $cell.on('mouseup', function (e) {
                if (e.button === 0) {
                    sendCellAction(cell, 'reveal');
                }
                else {
                    sendCellAction(cell, 'flag');
                }
            });

            // jQuery mobile: Enable long press to flag and vibrate phone
            $cell.on('touchstart', function (e) {
                tapHold = setTimeout(function () {
                    sendCellAction(cell, 'flag');
                    navigator.vibrate(50);
                    return false;
                }, longPressTime);
            }).on("touchend", function (e) {
                clearTimeout(tapHold);
                return true;
            });

            updateCell($cell, cell);

            $row.append($cell);
        });
        $grid.append($row);
    });
}

function sendCellAction(cell, action) {
    sendStringToWebSocket({
        action: action,
        row: cell.position.row,
        col: cell.position.col
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
    $grid.add($bodywrapper).add($nav).add($('#game')).removeClass('gameover gamewon');
    $profile.find('img').removeClass('spin');
    devMode = false;
    $('.alert').slideUp();
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
    $('#gameover-alert').slideDown();
}

function gameWon() {
    playTadaSound();
    celebratePage();
    disableGrid();
    $('#gamewon-alert').slideDown();
}

function disableGrid() {
    // disable further moves
    $('.cell').off();
}

function setGlobalVariables() {
    $bodywrapper = $('#body-wrapper');
    $grid = $('#grid');
    $nav = $('.navbar');
    $wsLog = $('#wsLog');
    $profile = $('#profile');
}

function removeClassAfter($target, classname, milliseconds) {
    setTimeout(function () {
        $target.removeClass(classname);
    }, milliseconds);
}

function explodePage() {
    $grid.add($bodywrapper).add($nav).add($('#game')).addClass('gameover');
    $grid.add($bodywrapper).add($nav).add($('#game')).addClass('gameover');
    $grid.children().children('.danger').not('.revealed').addClass('revealed mine fa fa-bomb');
    $grid.children().children().not('.revealed').addClass('falling');
    $profile.find('img').addClass('spin');

    // For animation, we hide overflow-y, so user could lose access to 'New Game' button unless we scroll up
    $bodywrapper.scrollTop(0, 0);

    navigator.vibrate(350);
}

function celebratePage() {
    $grid.add($bodywrapper).add($nav).addClass('gamewon');
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
