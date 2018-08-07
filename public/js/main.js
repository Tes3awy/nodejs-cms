$('.input-group-append').on('click', function() {
  var input = $(this).siblings();
  $(this).find('.input-group-text').find('i').toggleClass('fa-eye fa-eye-slash');
  if (input.attr('type') === 'password') {
    input.attr('type', 'text');
  } else {
    input.attr('type', 'password');
  }
});

$('input[type="email"]').emailautocomplete({
  suggClass: "email-input-class"
});