window._dhLoad = function() {
  $('.d-hide').each(function() {
    var _self = $(this);
    if (_self.is('[data-href]')) {
      _self.attr('href', Base64.decode(_self.attr('data-href')));
      _self.removeAttr('data-href');
    }
    if (_self.is('[data-html]')) {
      _self.html(Base64.decode(_self.attr('data-html')));
      _self.removeAttr('data-html');
    }
    if (_self.is('[data-text]')) {
      _self.html(Base64.decode(_self.attr('data-text')));
      _self.removeAttr('data-text');
    }
    _self.removeClass('d-hide');
  });
}

$(function() {
  window._dhLoad();
});

window._dhAjaxHtml = function(p) {
  var e = 'Internal Server Error';
  $.ajax({
    url: p.url,
    data: p.data || null,
    type: p.type || (p.data ? 'post' : 'get'),
    dataType: 'json',
    success: function(json) {
      if (json && json.error !== undefined) {
        if (json.error != '') {
          e = json.error;
        } else {
          if (json.html !== undefined) {
            p.success(json.html);
            return true;
          }
        }
      }
      if (p.error) {
        p.error(e);
      }
    },
    error: function() {
      if (p.error) {
        p.error(e);
      }
    }
  });
};

window._dhAjaxJson = function(p) {
  var e = 'Internal Server Error';
  $.ajax({
    url: p.url,
    data: p.data || null,
    type: p.type || (p.data ? 'post' : 'get'),
    dataType: 'json',
    success: function(json) {
      if (json && json.error !== undefined) {
        if (json.error != '') {
          e = json.error;
        } else {
          p.success(json);
          return true;
        }
      }
      if (p.error) {
        p.error(e);
      }
    },
    error: function() {
      if (p.error) {
        p.error(e);
      }
    }
  });
};