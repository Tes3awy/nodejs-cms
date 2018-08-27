// Show/Hide Password Fields
$('.input-group-append').on('click', function() {
  var input = $(this).siblings();
  $(this)
    .find('.input-group-text')
    .find('i')
    .toggleClass('fa-eye fa-eye-slash');
  if (input.attr('type') === 'password') {
    input.attr('type', 'text');
  } else {
    input.attr('type', 'password');
  }
});

// Autocomplete Email Init
$('input[type="email"]').emailautocomplete({
  suggClass: 'email-input-class',
});

// Custom hamburger Icon
$('.navbar-toggler').on('click', function() {
  $(this).toggleClass('is-active');
  $('.navbar-collapse.show[id]').each(function() {
    var target = $(this).attr('id');
    $('.navbar-toggler.is-active[data-target="#' + target + '"]').click();
  });
});

// Post Like `Button-like` feature
$('.post-tag').one('click', function(e) {
});

// Count Characters in `Add Post` page
$('.post-comp').on('input keyup', function() {
  var charsCount = $(this)
    .val()
    .replace(/\s/g, '').length;
  var countArea = $(this).siblings();
  countArea.text(charsCount + ' characters');
  countArea.text(charsCount + ' characters');
});

// Lightbox for /posts images
$('a[data-toggle="lightbox"]').on('click', function(e) {
  e.preventDefault();
  $(this).ekkoLightbox();
});

// Add post image name before upload
$('#inputImage').on('change', function() {
  $('#image-name').text(
    this.files && this.files.length ? this.files[0].name : '',
  );
});

// Preview post image before upload
$('#previewImageContainer').hide();
$('#inputImage').on('change', function() {
  $('#previewImageContainer').slideDown(300);
  document.getElementById('#previewImage').src = window.URL.createObjectURL(
    this.files[0],
  );
});

// Count Contact us page's textarea characters
$('textarea[name="message"]').on("input", function() {
  var maxlength = $(this).attr("maxlength");
  var currentLength = $(this).val().length;

  if(currentLength >= maxlength ) {
      $('#suggestionCount').html("You have reached the maximum number of characters.");
  } else {
    $('#suggestionCount').html(maxlength - currentLength + " characters left");
  }
});

// TinyMCE Init
$(document).ready(function() {
  var tinymceConfig = {
    selector: "textarea#tinymce",
    skins: 'vendor/tinymce/skins/lightgray',
    theme: 'modern',
    plugins: [
      "anchor autolink codesample colorpicker charactercount contextmenu fullscreen help",
      " lists link noneditable preview",
      " searchreplace table textcolor print"
    ],
    toolbar:
      "undo redo | bold italic | forecolor backcolor | codesample | alignleft aligncenter alignright alignjustify | bullist numlist | link",
    paste_as_text: true,
    paste_text_sticky_default: true,
    paste_text_sticky: true,
    paste_filter_drop: false,
    hidden_input: false,
    height: 300,
    browser_spellcheck: true,
    gecko_spellcheck: false,
    branding: false,
    elementpath: false,
    autosave_ask_before_unload: false,
    codesample_dialog_width: 600,
    codesample_dialog_height: 425,
  };
  tinymce.init(tinymceConfig);
});
