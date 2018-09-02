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
$('#image-name').hide()
$('#inputImage').on('change', function() {
  $('#previewImageContainer').slideDown(300);
  $('#image-name').slideDown(300);
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

// Chosen for category select
$(".chosen-select").chosen({max_selected_options: 3}).change( function() {
  console.log('Chosen value:', $(this).val());
});

// Perfect Scrollbar Init
if($("#perfectScrollbar").length > 0) {
  const ps = new PerfectScrollbar('#perfectScrollbar', {
    wheelSpeed: 0.5,
    wheelPropagation: false,
    maxScrollbarLength : 50
  });
}

// Disable Context menu on Images
$("img").on("contextmenu", function() {
  return false;
});

$(document).ready(function() {
  // TinyMCE Init
  var tinymceConfig = {
    selector: "textarea#tinymce",
    skins: 'vendor/tinymce/skins/lightgray',
    theme: 'modern',
    toolbar:
      "undo redo | bold italic | forecolor backcolor | codesample code | spellchecker | alignleft aligncenter alignright alignjustify | bullist numlist | link",
    plugins: [
      "anchor autolink codesample spellchecker colorpicker charactercount contextmenu code",
      " lists link noneditable preview",
      " searchreplace table textcolor print"
    ],
    codesample_languages: [
        {text: 'HTML/XML', value: 'markup'},
        {text: 'JavaScript', value: 'javascript'},
        {text: 'CSS', value: 'css'},
        {text: 'PHP', value: 'php'},
        {text: 'Ruby', value: 'ruby'},
        {text: 'Python', value: 'python'},
        {text: 'Java', value: 'java'},
        {text: 'C', value: 'c'},
        {text: 'C#', value: 'csharp'},
        {text: 'C++', value: 'cpp'},
        {text: 'JSON', value: 'json'},
        {text: 'Swift', value: 'swift'},
        {text: 'Objective-C', value: 'objective-c'},
    ],
    paste_as_text: true,
    language: 'en',
    directionality: 'ltr',
    paste_data_images: false,
    paste_enable_default_filters: true,
    paste_text_sticky_default: true,
    paste_text_sticky: true,
    paste_filter_drop: false,
    element_format : 'html',
    hidden_input: false,
    height: 300,
    browser_spellcheck: true,
    gecko_spellcheck: false,
    branding: false,
    elementpath: false,
    autosave_ask_before_unload: false,
    codesample_dialog_width: 600,
    codesample_dialog_height: 425,
    table_responsive_width: true,
    // table_class_list: [
    //   {title: 'table', value: 'table; table-light; table-bordered; table-striped; text-dark'}
    // ]
  };
  tinymce.init(tinymceConfig);

  // DataTables
  if($("#dataTable").length > 0) {
    $('#dataTable').DataTable({
      stateSave: true,
      rowReorder: true,
      fixedHeader: true,
      responsive: true
    });
  };

  // Auto hide alerts
  $(".alert").fadeTo(3000, 500).slideUp(500, function(){
    $(this).slideUp(500);
  });

  // Delete Account confirm box
  // $("#deleteAccount").on('submit', function(e) {
  //   e.preventDefault();
  //   swal({
  //     title: 'Are you sure?',
  //     text: "You won't be able to revert action!",
  //     type: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#17a2b8',
  //     cancelButtonColor: '#dc3545',
  //     confirmButtonText: 'Yes, delete it!'
  //   }).then((res) => {
  //     if (res.value) {
  //       return swal(
  //         'Deleted!',
  //         'Your file has been deleted.',
  //         'success'
  //       );
  //     }
  //     swal(
  //       'Cancelled',
  //       'Your account is safe :)',
  //       'error'
  //     );
  //   });
  // });
});

// Detect Ad Blocker
if(!document.querySelector('.ad-alert')) {
  var el = document.createElement('div');
  el.className = 'ad-alert';
  el.innerHTML = '<div class="container text-center text-danger" role="alert">' +
                    '<h2 class="mb-4">Ad Blocker Detected</h2>' +
                    '<h3>Our website is made possible by displaying online advertisements to our visitors.<br>' +
                    'Please consider supporting us by disabling your ad blocker.</h3>' +
                  '</div>'
  el.style.display = 'none';

  document.body.appendChild(el);
  document.querySelector('.ad-alert').style.display = 'block';
  document.body.style.overflowY = 'hidden';
  console.log('Ad Blocker Detected');
  $("html").on("contextmenu", function() {
    return false;
  });
} else {
  console.log('No Ad Blocker Detected');
}
