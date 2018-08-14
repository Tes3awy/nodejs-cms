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
$(".post-tag").one('click', function(e) {
  const $el = $(e.currentTarget);
  console.log($el);
  const $uniqueId = $el.attr('id');
  const $i = $el.find('i');
  console.log($i);

  $i.toggleClass('fa-meh fa-smile-beam text-warning text-success');

  // toastr.options.progressBar = false;
  // toastr.options.preventDuplicates = true;
  // toastr.options.positionClass = "toast-bottom-center";
  // toastr.options.showDuration = 300;
  // toastr.options.hideDuration = 500;
  // toastr.options.timeOut = 1000;
  // toastr.success('You liked the post <i class="fas fa-smile-beam"></i>');

  var likeState = $i.hasClass('fa-smile-beam');
  localStorage.setItem(`likeState-${$uniqueId}`, likeState);

  $(document).ready(function() {
    const $postTags = $('.post-tag');
    $postTags.each((el) => {
      const $el = $(el);
      const $uniqueId = $el.attr('id');
      const $i = $el.find('i');

      // Now you apply the state stored in local sotrage to your buttons.
      const likedStorage = localStorage.getItem(`likeState-${$uniqueId}`);
      if(likedStorage && $i.hasClass('fa-smile-beam')) {
        $i.removeClass('fa-meh text-warning');
      }
    });
  });
});

// Count Characters in `Add Post` page
$('.post-comp').on('input keyup', function() {
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
  document.getElementById('#previewImage').src = window.URL.createObjectURL(this.files[0]);
});

// TinyMCE Init
$(document).ready( function() {
  tinymce.init({
    selector: 'textarea#tinymce',
    skins: 'vendor/tinymce/skins/lightgray',
    hidden_input: false,
    toolbar: 'removeformat | undo redo | bold italic | forecolor backcolor | alignleft aligncenter alignright | ltr rtl | bullist numlist | link | emoticons | spellchecker | pastetext | code codesample | print preview',
    plugins : 'contextmenu autosave advlist autolink link lists charmap print preview emoticons colorpicker spellchecker wordcount directionality textcolor colorpicker',
    contextmenu: 'copy cut paste link spellchecker',
    mobile: {
      theme: 'mobile',
      plugins: [ 'autosave', 'lists', 'autolink' ],
      toolbar: [ 'undo', 'redo' , 'bold' , 'italic' ]
    },
    mentions_fetch: function (query, success) {
      //Fetch your full user list from somewhere
      var users = getUserDataFromTheServer();

      //query.term is the text the user typed after the '@'
      users = users.filter(function (user) {
        return user.name.indexOf(query.term.toLowerCase()) === 0;
      });

      users = users.slice(0, 10);

      window.setTimeout(function () {
        success(users);
      }, 0);
    },
    paste_as_text: true,
    browser_spellcheck: true,
    gecko_spellcheck: false,
    branding: false,
    elementpath: false,
    height : 200,
    paste_filter_drop: false
  });
});

// var $imageInp = $('.custom-file-input').val();
// if($imageInp === "") {
//   var $imageVal = $("#hiddenInpImg").val();
//   console.log('Same Image name:', '/uploads/' + $imageVal);
// }
// // Check when editing article if there is a new uploaded image or not.
// $(document).on('chnage', '#inputImage', function() {
//   var $imageInp = $('.custom-file-input').val();
//   if($imageInp === "") {
//     var $imageVal = $("#hiddenInpImg").val();
//     console.log('Same Image name:', $imageVal);
//   } else {
//     var $uploadedImg = $("#inputImage").href.substr($("#inputImage").href.lastIndexOf('/') + 1);
//     console.log('Uploaded Image name:', $uploadedImg);
//   }
// });

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
