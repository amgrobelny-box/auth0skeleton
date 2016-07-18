
var box = new BoxSdk();
var client = new box.BasicBoxClient({ accessToken: '#{user.boxAccessTokenObject.accessToken}' });
client.folders.get({ id: "0" })
  .then(function (folder) {
    console.log(folder);
  });

var form = document.getElementById('file-form');
var fileSelect = document.getElementById('file-select');
var uploadButton = document.getElementById('upload-button');

form.onsubmit = function (event) {
  event.preventDefault();
  uploadButton.innerHTML = 'Uploading...';

  // The Box Auth Header. Add your access token.
  var headers = { Authorization: 'Bearer #{user.boxAccessTokenObject.accessToken}' };
  var uploadUrl = 'https://upload.box.com/api/2.0/files/content';

  var files = fileSelect.files;
  var formData = new FormData();

  formData.append('files', files[0], files[0].name);

  // Add the destination folder for the upload to the form
  formData.append('parent_id', '0');

  $.ajax({
    url: uploadUrl,
    headers: headers,
    type: 'POST',
    // This prevents JQuery from trying to append the form as a querystring
    processData: false,
    contentType: false,
    data: formData
  }).complete(function (data) {
    uploadButton.innerHTML = 'Upload';
    // Log the JSON response to prove this worked
    console.log(data.responseText);
    location.reload(true);
  });
}