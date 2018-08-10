// Show/Hide Password Fields
$('.input-group-append').on('click', function() {
  var input = $(this).siblings();
  $(this).find('.input-group-text').find('i').toggleClass('fa-eye fa-eye-slash');
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
$(".post-tag").one('click', function() {
  $(this).find('i').toggleClass('fa-meh fa-smile-beam text-warning text-success');
  toastr.options.progressBar = true;
  toastr.options.preventDuplicates = true;
  toastr.options.positionClass = "toast-bottom-center";
  toastr.success('You liked the post <i class="fas fa-smile-beam"></i>', {timeOut: 3000});
});

// Count Characters in `Add Post` page
$('.post-comp').on('input keyup', function(){
  var charsCount = $(this).val().replace(/\s/g, '').length;
  var countArea = $(this).siblings();
  countArea.text(charsCount + " characters");
  countArea.text(charsCount + " characters");
});

// Lightbox for /posts images
$('a[data-toggle="lightbox"]').on('click', function(e) {
  e.preventDefault();
  $(this).ekkoLightbox();
});

// Add post image name before upload
$('#inputImage').on('change', function() {
  $('#image-name').text(this.files && this.files.length ? this.files[0].name : '');
});

// Preview post image before upload
$('#previewImageContainer').hide();
$("#inputImage").on('change', function() {
  $('#previewImageContainer').slideDown(300);
  document.getElementById('#previewImage').src = window.URL.createObjectURL(this.files[0])
});

$(document).ready( function() {
  // Summernote Init
  if($('#summernote')[0]) {
    $('#summernote').summernote({
      placeholder: 'Starting typing your post',
      tabsize: 2,
      height: 200,
      code: 'html_tags_string_from_db',
      disableDragAndDrop: true,
      codemirror: {
        theme: 'oceanic-next'
      },
      toolbar: [
        // [groupName, [list of button]]
        ['style', ['bold', 'italic', 'underline', 'clear']],
        ['fontsize', ['fontsize', 'fontname']],
        ['font', ['strikethrough', 'superscript', 'subscript']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['insert',['ltr','rtl', 'hr']],
        ['misc', ['undo', 'redo']],
        ['codeview', ['codeview']]
      ],
      callbacks: {
        onPaste: function (e) {
          var bufferText = ((e.originalEvent || e).clipboardData || window.clipboardData).getData('Text');
          e.preventDefault();
          document.execCommand('insertText', false, bufferText);
        }
      }
    });
  }
});

// Custom Functions
function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.load = function(e) {
      $('#previewImage').attr('src', e.target.result);
    }
    reader.readAsDataURL(input.files[0]);
  }
}
