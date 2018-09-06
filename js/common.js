(function () {

  $('.select').on('click', '.select__placeholder', function () {
    var parent = $(this).closest('.select');
    if (!parent.hasClass('is-open')) {
      parent.addClass('is-open');
      $('.select.is-open').not(parent).removeClass('is-open');
    } else {
      parent.removeClass('is-open');
    }
  }).on('click', 'ul>li', function () {
    var parent = $(this).closest('.select');
    parent.removeClass('is-open').find('.select__placeholder').text($(this).text());
    parent.find('input[type=hidden]').attr('value', $(this).attr('data-value'));
  });


  $(document).click(function (event) {
    if ($(event.target).closest(".select__list, .select__list li, .select").length) return;
    $(".select").removeClass('is-open')
    event.stopPropagation();
  });

  var sidebar = new StickySidebar('.sidebar', {
    topSpacing: 120,
    bottomSpacing: 0,
    containerSelector: '.main__track',
    innerWrapperSelector: '.sidebar__inner'
  });

  $(window).on('resize load', function() {
    
    if(window.matchMedia("(min-width: 1170px)").matches) {
      sidebar.updateSticky()
    } else {
      sidebar.destroy()
    }
  })

  $('.toggle-mobile-btn').on('click', function() {
    $('.sidebar').toggleClass('active')
  })

})()