if (window.console) {
  console.log("Welcome to your Play application's JavaScript!");
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

