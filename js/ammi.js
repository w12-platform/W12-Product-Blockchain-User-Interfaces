$(function($) {

  try {
    $('.show-detailed-scale').on('click', function() {
  		$(this).next('.types-graph.static').slideToggle();
  		$(this).toggleClass('active');

  		if($(this).hasClass('active')) {
  			$(this).text('Hide detailed scale');
  		} else {
  			$(this).text('Show detailed scale');
  		}
  	})
  	// Выставление оценок в форме комментарий
  	$('.types-graph.reviews .types-graph-chart span').hover(function() {
  		$(this).toggleClass('hovered');
  		$(this).prevAll('span').toggleClass('hovered');
  	})

  	$('.types-graph.reviews .types-graph-chart span').on('click', function() {
  		var dataValue = $(this).attr('data-value');
  		var input = $(this).parent().find('input');

  		$(this).addClass('active');
  		$(this).prevAll('span').addClass('active');
  		$(this).nextAll('span').removeClass('active');

  		input.attr('value', dataValue);

  		console.log(input.value);
  	})

  	$('.types-graph.reviews .types-graph-chart').mouseenter(function() {
  		$(this).find('span').removeClass('active');
  	})

  	// Прогресс на  чартах в карточке
  	$('.types-graph-chart-progress').each(function() {
  		$(this).css('max-width', $(this).attr('data-width'));
  	});

    /*

  	// Демо увелечение виджетов

  	function setHeightWidget (value) {
  		$('.vidgets-logos-item-img, .vidgets-logos-item-code').css('height', value)
  	}

    $('.vidget-form button').on('click', function(e) {
  		e.preventDefault()
  		var heightInput = $('.vidget-form input').val()
  		setHeightWidget(heightInput)
  	})

  	// Табы на странице виджетов и логотипов
  	jQuery(".vidgets-logos-tab_item").not(":first").hide();
  	jQuery(".vidgets-logos-tab").click(function() {
  		jQuery(".vidgets-logos-tab").removeClass("active").eq(jQuery(this).index()).addClass("active");
  		jQuery(".vidgets-logos-tab_item").hide().eq(jQuery(this).index()).fadeIn()
  	}).eq(0).addClass("active");
  	*/

    if ($('.list-projects-item').length) {
      // Выравнивание по высоте карточек на главной только при ширине экрана больше 768
  		$(window).on('load resize', function() {
  			if(window.matchMedia("(min-width: 768px)").matches) {
  				$('.list-projects-item').equalHeights();
  			}
  		})
    }

    $(".vidgets-logos-item-code").mCustomScrollbar();


  	// mobal menu
  	$('.btn-menu').on('click', function() {
  		$('.global-menu').addClass('active')
  		$('html').css('overflow','hidden');
  		return false;
  	})

  	$('.global-menu').on('swiperight',function(){
  		$('.global-menu').removeClass('active')
  		$('html').css('overflow','auto');
  	})

  	$('.close-global-menu').on('click',function(){
  		$('.global-menu').removeClass('active')
  		$('html').css('overflow','auto');
  	})

  	$('.mobile-menu-catalog > a').on('click', function() {
  		$(this).parents('.mobile-menu-item').toggleClass('active')
  		$(this).next('.mobile-menu-sub').slideToggle('fast')
  		return false
  	})

  	$('.m-pp-link').on('click', function() {
  		$(this).toggleClass('active')
  		$('.m-pp-slide').slideToggle('fast')
  		return false
  	})

  	$('.btn-side-menu').on('click', function() {
  		$('.side-menu').toggleClass('active')
  		return false
  	})

  	$(window).scroll(function() {
  		if ( this.pageYOffset > $('.wellcome').outerHeight(true) ) {
              $('.header-line').addClass('active')
          } else {
              $('.header-line').removeClass('active')
          }

      }).trigger('scroll')

  	$('[data-toggle="popover"]').popover({
  		trigger: 'hover'
  	})

      $(".phone").mask("+7 (999) 999-99-99",{placeholder:"_"})

      if ( $('.slider-wellcome').length ) {

      	$('.slider-wellcome').slick({
  		  	infinite: true,
  			speed: 500,
  			fade: true,
  			cssEase: 'linear',
  			//autoplay: true,
        autoplay: false,
  			//autoplaySpeed: 3000,
        autoplaySpeed: 5000,
  			responsive: [
  			    {
  			      breakpoint: 991,
  			      settings: {
  					arrows: false,
  					dots: true
  			      }
  			    }
  			]
  		})

  		$('.slider-wellcome-points-item').on('click', function() {
  			$(this).addClass('active').siblings('div').removeClass('active')
              $('.slider-wellcome').slick('slickGoTo',$(this).index())
  		})

  		$('.slider-wellcome').on('afterChange', function(event, slick, currentSlide, nextSlide){
  			$('.slider-wellcome-points-item').eq(currentSlide).addClass('active').siblings('div').removeClass('active')
  		})
      }

      if ( $('.slider-hotprojects').length ) {
        $('.slider-hotprojects').slick({
          infinite: false,
          slidesToShow: 1,
          slidesToScroll: 1,
          responsive: [{
            breakpoint: 991,
            settings: {
              arrows: false,
              dots: false,
              centerMode: true,
              centerPadding: '150px'
            }
          },
          {
            breakpoint: 767,
            settings: {
              arrows: false,
              dots: false,
              centerMode: true,
              centerPadding: '70px'
            }
          },
          {
            breakpoint: 568,
            settings: {
              centerMode: true,
              centerPadding: '0',
              variableWidth: true,
              arrows: false
            }
          }]
        });
      }

      if ( $('.slider-photo-mini').length ) {
        $('.slider-photo-mini').slick({
          infinite: true,
          slidesToShow: 1,
          slidesToScroll: 1,
          fade: true,
          cssEase: 'linear',
          arrows: false
        });
      }

  	/*$slick = $('.project-photo-nav')

  	$slick.on('init reInit afterChange', function(e, i) {
  		var $width = i.listWidth;
  		var $itemsWidth = i.$slides[0].clientWidth;
  		var $visible = Math.round($width/$itemsWidth);

  		console.log($visible);

  		if(i.$slides.length < $visible) {
  			$('.project-photo-nav').addClass('less')
  		}
  	})

      if ( $('.project-photo').length ) {


      	var  _max_slides = $('.project-photo-nav-item').length;
      	$('.project-photo').slick({
  		  infinite: false,
  		  slidesToShow: 1,
  		  slidesToScroll: 1,
  		  arrows: false,
  		  fade: true,
  		  asNavFor: '.project-photo-nav'
  		})

  		$slick.slick({
  		  infinite: false,
  		  asNavFor: '.project-photo',
  		  slidesToScroll: 1,
    		  variableWidth: true,
  		  arrows: true,
  		  focusOnSelect: true
  		})
      }*/

      /*$('.faq-list-head').on('click', function() {

      $('.faq-list-head').on('click', function() {
      	$(this).toggleClass('active')
      	$(this).parents('.faq-list-item').find('.faq-list-content').slideToggle('fast')
      })

      $('.faq-list-mini-head').on('click', function() {
      	$(this).toggleClass('active')
      	$(this).parents('.faq-list-mini-item').find('.faq-list-mini-content').slideToggle('fast')
      })*/

      /*$('.add-topic-head').on('click', function() {
      	$(this).toggleClass('active')
      	$(this).next('.add-topic-content').slideToggle('fast')
      })

      $('.link-answer-comment').on('click', function() {
      	$(this).next('.form-answer').slideToggle('fast')
      	return false
      })

      $('.link-add-comment').on('click', function() {
      	$(this).parent('div').next('.form-answer').slideToggle('fast')
      	return false
      })

      $('.acc-block-head').on('click', function() {
      	$(this).parent('.acc-block').toggleClass('active')
      	$(this).next('.acc-block-content').slideToggle('fast')
      })

      $('.acc-block').each(function() {
      	if ( $(this).hasClass('active') ) {
      		$(this).find('.acc-block-content').slideToggle('fast')
      	}
      })*/

      if ( $('select').length ) {
      	$('select').not('.default').styler()
      }

  	$('.side-menu-btn').on('click', function() {
  		$('.side-menu').toggleClass('active')
  		$('html').toggleClass('html-hidden')
  	})

    sidefix();
  	sidefixleft();

  	$(window).on("orientationchange", function() {
  		sidefix();
  		// sidefixleft()
  	})

  	$(window).resize(function() {
  		sidefix();
  		// sidefixleft()
  	})
  	$(window).load(function() {
  		sidefix();
  		// sidefixleft()
  	})

      /*if ( $('.side-menu').length ) {
  		$('#list').ddscrollSpy({
  			scrolltopoffset: 0 - ($('header').outerHeight())
  		})
      }*/

      $('.header-pp-name').on('click', function() {
      	$('.header-pp-popup').slideToggle('fast')
      	return false
      })

  	$(document).click( function(event){
  		if( $(event.target).closest(".header-pp-popup").length )
  		  return
  		$(".header-pp-popup").slideUp("fast")
  		event.stopPropagation()
  	})

  	$('.show-contacts').on('click', function() {
  		$(this).toggleClass('active')
  		$(this).parents('.vacancy-text').find('.vacancy-user-listcontacts').slideToggle(0)
  		return false
  	})

  	$('.btn-showcontacts').on('click', function() {
  		$(this).toggleClass('active')
  		$(this).parents('.resume').find('.vacancy-user-listcontacts').slideToggle(0)
  		return false
  	})

  	$('.vacancy-slide-more').on('click', function() {
  		$(this).parents('.vacancy').toggleClass('active')
  		if ( !$(this).parents('.vacancy').hasClass('active') ) {
  			$(this).parents('.vacancy').find('.vacancy-user-listcontacts').slideUp(0)
  			$(this).parents('.vacancy').find('.btn-showcontacts').slideUp(0)
  		}
  		return false
  	})

  	$('.tags-more').on('click', function() {
  		$(this).hide(0)
  		$(this).parents('.resume-tags').find('.resume-tags-item:nth-child(n+6)').show('fast')
  		return false
  	})

  	$('.resume-slidedown').on('click', function() {
  		$(this).hide(0)
  		$(this).parents('.resume').addClass('active')
  		return false
  	})

  	$('.resume-slideup').on('click', function() {
  		$(this).parents('.resume').removeClass('active')
  		if ( !$(this).parents('.resume').hasClass('active') ) {
  			$(this).parents('.resume').find('.vacancy-user-listcontacts').slideUp(0)
  		}
  		$(this).parents('.resume').find('.resume-slidedown').slideDown(0)
  		$(this).parents('.resume').find('.btn-showcontacts').removeClass('active')
  		return false
  	})

  	if ( $('#dropZone').length ) {
  		/*var dropZone = $('#dropZone'),
  		var dropZone = $('#dropZone'),
  	        maxFileSize = 1000000;

  	    if (typeof(window.FileReader) == 'undefined') {
  		    dropZone.text('Ошибка!')
  		    dropZone.addClass('error')
  		}

  		dropZone[0].ondragover = function() {
  		    dropZone.addClass('hover')
  		    return false
  		}

  		dropZone[0].ondragleave = function() {
  		    dropZone.removeClass('hover')
  		    return false
  		}

  		dropZone[0].ondrop = function(event) {
  		    event.preventDefault()
  		    dropZone.removeClass('hover')
  		    dropZone.addClass('drop')
  		}*/
  	}

  	/*if ( $('.date').length ) {
  		$('.date').datepicker({
  			language: 'ru',
  		    format: 'mm.dd.yyyy'
  		})
  	}*/

  	if ( $('.teamlist').length ) {

  		/*$( "#teamlist-00" ).sortable({
  		  appendTo: $('.teamlist-wrapper'),
  		  containment: "parent",
  		  items: " > .persona",
  		  axis: "y"
  	    })

  		$( "#teamlist-01" ).sortable({
  		  appendTo: $('.teamlist-wrapper'),
  		  containment: "parent",
  		  items: " > .persona",
  		  axis: "y"
  	    })

  		$( "#teamlist-02" ).sortable({
  		  appendTo: $('.teamlist-wrapper'),
  		  containment: "parent",
  		  items: " > .persona",
  		  axis: "y"
  	    })

  		$( "#teamlist-03" ).sortable({
  		  appendTo: $('.teamlist-wrapper'),
  		  containment: "parent",
  		  items: " > .persona",
  		  axis: "y"
  	    })*/
  	}

    /*$('.scriptslide').on('click', function() {
  		$(this).toggleClass('active')
  		$('.form-hidden').slideToggle('fast')
  	    if ( $('select').length ) {
  	    	$('select').styler()
  	    }
  		return false
  	})*/

  	/*$('.personna-delete').on('click', function() {
  		$(this).parents('.persona').remove()
  		sidefixleft()
  		return false
  	})
    */

    // вызываем окно alert изакрываем его через 3 секунды. Функция схематичная, в качестве примера
  	//alertexample()

  	// новый рейтинг
  	if ( $('.rating__input').length ) {
  		$('.rating__input').rating({
  		  clearable: false
  		})
  	}


      /*var barChartData = {
              datasets: [{
                  data: [
                      61,
                      12,
                      14,
                      23,
                  ],
  	        	borderWidth: 2,
                  backgroundColor: [
                      '#1870ec',
                      '#2eaa38',
                      '#feb13b',
                      '#e7451f',
                  ],
                  label: 'Details',
              }],
              labels: [
                  "Crowdsale",
                  "Founders & Employees",
                  "Advsiors Supportes & Bounty",
                  "Advsiors Supportes & Bounty"
              ]
      	};


      var barChartData3 = {
              datasets: [{
                  data: [
                      1000,
                      555,
                      30,
                      45,
                  ],
  	        	borderWidth: 2,
                  backgroundColor: [
                      '#1870ec',
                      '#2eaa38',
                      '#feb13b',
                      '#e7451f',
                  ],
                  label: 'Details',
              }],
              labels: [
                  "Crowdsale",
                  "Founders & Employees",
                  "Advsiors Supportes & Bounty",
                  "Advsiors Supportes & Bounty"
              ]
      	};



      var barChartData2 = {
              datasets: [{
                  data: [
                      6,
                      2,
                      2,
                  ],
  	        	borderWidth: 2,
                  backgroundColor: [
                      '#0178f8',
                      '#feb13b',
                      '#00c846',
                  ],
                  label: 'My projects',
              }],
              labels: [
                  "PRE-ICO",
                  "ICO",
                  "D&V"
              ]
      	};

   	var pluginWithPercent = {
  	    afterDatasetsDraw: function(chart, easing) {
  	        var ctx = chart.ctx;

  	        chart.data.datasets.forEach(function (dataset, i) {
  	            var meta = chart.getDatasetMeta(i);
  	            if (!meta.hidden) {
  	                meta.data.forEach(function(element, index) {
  	                    ctx.fillStyle = '#181818';

  	                    var fontSize = 14;
  	                    var fontStyle = 'bold';
  	                    var fontFamily = 'HelveticaNeueCyrBold';
  	                    ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

  	                    var dataString = dataset.data[index].toString() + '%';

  	                    ctx.textAlign = 'center';
  	                    ctx.textBaseline = 'middle';

  	                    var padding = 5;
  	                    var position = element.tooltipPosition();
  						ctx.fillText(dataString, position.x, position.y);
  	                });
  	            }
  	        });
  	    }
  	}

   	var pluginWithDollars = {
  	    afterDatasetsDraw: function(chart, easing) {
  	        var ctx = chart.ctx;

  	        chart.data.datasets.forEach(function (dataset, i) {
  	            var meta = chart.getDatasetMeta(i);
  	            if (!meta.hidden) {
  	                meta.data.forEach(function(element, index) {
  	                    ctx.fillStyle = '#181818';

  	                    var fontSize = 14;
  	                    var fontStyle = 'bold';
  	                    var fontFamily = 'HelveticaNeueCyrBold';
  	                    ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

  	                    var dataString = dataset.data[index].toString() + '$';

  	                    ctx.textAlign = 'center';
  	                    ctx.textBaseline = 'middle';

  	                    var padding = 5;
  	                    var position = element.tooltipPosition();
  						ctx.fillText(dataString, position.x, position.y);
  	                });
  	            }
  	        });
  	    }
  	}

  	if ( $('#chart-area').length ) {
  		var ctx = document.getElementById('chart-area').getContext('2d');

  	 window.myBar = new Chart(ctx, {
  		 		plugins: [pluginWithPercent],
  	        	type: 'pie',
  	            data: barChartData,
  	            options: {
  	                responsive: true,
          			maintainAspectRatio: false,
  		            legend: {
  			            display: false
  			        },
  			        tooltips: {
  			            enabled: false,
  			            mode: 'index',
  			            position: 'nearest',
  			            custom: function(tooltipModel) {
  			                var tooltipEl = document.getElementById('chartjs-tooltip');
  			                if (!tooltipEl) {
  			                    tooltipEl = document.createElement('div');
  			                    tooltipEl.id = 'chartjs-tooltip';
  			                    tooltipEl.innerHTML = "<table></table>"
  			                    document.body.appendChild(tooltipEl);
  			                }
  			                if (tooltipModel.opacity === 0) {
  			                    tooltipEl.style.opacity = 0;
  			                    return;
  			                }

  			                tooltipEl.classList.remove('above', 'below', 'no-transform');
  			                if (tooltipModel.yAlign) {
  			                    tooltipEl.classList.add(tooltipModel.yAlign);
  			                } else {
  			                    tooltipEl.classList.add('no-transform');
  			                }

  			                function getBody(bodyItem) {
  			                    return bodyItem.lines;
  			                }

  			                if (tooltipModel.body) {
  			                    var titleLines = tooltipModel.title || [];
  			                    var bodyLines = tooltipModel.body.map(getBody);

  			                    var innerHtml = '';

  			                    // titleLines.forEach(function(title) {
  			                    //     innerHtml += '<tr><th>' + title + '</th></tr>';
  			                    // });
  			                    // innerHtml += '</thead><tbody>';

  			                    bodyLines.forEach(function(body, i) {
  			                        var colors = tooltipModel.labelColors[i];
  			                        var style = 'background:' + colors.backgroundColor;
  			                        style += '; border-color:' + colors.borderColor;
  			                        style += '; border-width: 2px';
  			                        var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
  			                        innerHtml += '<tr><td>' + span + body + '%</td></tr>';
  			                    });
  			                    innerHtml += '</tbody>';

  			                    var tableRoot = tooltipEl.querySelector('table');
  			                    tableRoot.innerHTML = innerHtml;
  			                }

  			                // `this` will be the overall tooltip
  			                var position = this._chart.canvas.getBoundingClientRect();

  			                // Display, position, and set styles for font
  			                tooltipEl.style.opacity = 1;
  			                tooltipEl.style.left = position.left + tooltipModel.caretX + 'px';
  			                tooltipEl.style.top = position.top + tooltipModel.caretY + 'px';
  			                tooltipEl.style.fontSize = tooltipModel.fontSize;
  			                tooltipEl.style.fontStyle = tooltipModel._fontStyle;
  			                tooltipEl.style.padding = '5px ' + '10px';
  			            }
  			        },
  			        cutoutPercentage: 10
  	            }
  	 })
  	}

  	if ( $('#chart-area3').length ) {
  		var ctx2 = document.getElementById('chart-area3').getContext('2d');

  	 window.myBar2 = new Chart(ctx2, {
  		 		plugins: [pluginWithDollars],
  	        	type: 'pie',
  	            data: barChartData3,
  	            options: {
  	                responsive: true,
          			maintainAspectRatio: false,
  		            legend: {
  			            display: false
  					},
  			        tooltips: {
  			            enabled: false,
  			            mode: 'index',
  			            position: 'nearest',
  			            custom: function(tooltipModel) {
  			                var tooltipEl = document.getElementById('chartjs-tooltip3');
  			                if (!tooltipEl) {
  			                    tooltipEl = document.createElement('div');
  			                    tooltipEl.id = 'chartjs-tooltip3';
  			                    tooltipEl.innerHTML = "<table></table>"
  			                    document.body.appendChild(tooltipEl);
  			                }
  			                if (tooltipModel.opacity === 0) {
  			                    tooltipEl.style.opacity = 0;
  			                    return;
  			                }

  			                tooltipEl.classList.remove('above', 'below', 'no-transform');
  			                if (tooltipModel.yAlign) {
  			                    tooltipEl.classList.add(tooltipModel.yAlign);
  			                } else {
  			                    tooltipEl.classList.add('no-transform');
  			                }

  			                function getBody(bodyItem) {
  			                    return bodyItem.lines;
  			                }

  			                if (tooltipModel.body) {
  			                    var titleLines = tooltipModel.title || [];
  			                    var bodyLines = tooltipModel.body.map(getBody);

  			                    var innerHtml = '';

  			                    // titleLines.forEach(function(title) {
  			                    //     innerHtml += '<tr><th>' + title + '</th></tr>';
  			                    // });
  			                    // innerHtml += '</thead><tbody>';

  			                    bodyLines.forEach(function(body, i) {
  			                        var colors = tooltipModel.labelColors[i];
  			                        var style = 'background:' + colors.backgroundColor;
  			                        style += '; border-color:' + colors.borderColor;
  			                        style += '; border-width: 2px';
  			                        var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
  			                        innerHtml += '<tr><td>' + span + body + '$</td></tr>';
  			                    });
  			                    innerHtml += '</tbody>';

  			                    var tableRoot = tooltipEl.querySelector('table');
  			                    tableRoot.innerHTML = innerHtml;
  			                }

  			                // `this` will be the overall tooltip
  			                var position = this._chart.canvas.getBoundingClientRect();

  			                // Display, position, and set styles for font
  			                tooltipEl.style.opacity = 1;
  			                tooltipEl.style.left = position.left + tooltipModel.caretX + 'px';
  			                tooltipEl.style.top = position.top + tooltipModel.caretY + 'px';
  			                tooltipEl.style.fontSize = tooltipModel.fontSize;
  			                tooltipEl.style.fontStyle = tooltipModel._fontStyle;
  			                tooltipEl.style.padding = '5px ' + '10px';
  			            }
  			        },
  					cutoutPercentage: 10,
  	            }
  	 })
  	}

      if ( $('#chart-area2').length ) {

          var ctx = document.getElementById('chart-area2').getContext('2d');
          window.myBar = new Chart(ctx, {
  			plugins: [pluginWithPercent],
          	type: 'doughnut',
              data: barChartData2,
              options: {
                  responsive: true,
                  title: {
  		            display: true,
  		            text: '10 Projects',
  		            position: 'bottom',
  		        },
      			maintainAspectRatio: false,
  	            legend: {
  		            display: false
  		        },tooltips: {
  		            enabled: false,
  		            mode: 'index',
  		            position: 'nearest',
  		            custom: function(tooltipModel) {
  		                var tooltipEl = document.getElementById('chartjs-tooltip');
  		                if (!tooltipEl) {
  		                    tooltipEl = document.createElement('div');
  		                    tooltipEl.id = 'chartjs-tooltip';
  		                    tooltipEl.innerHTML = "<table></table>"
  		                    document.body.appendChild(tooltipEl);
  		                }
  		                if (tooltipModel.opacity === 0) {
  		                    tooltipEl.style.opacity = 0;
  		                    return;
  		                }

  		                tooltipEl.classList.remove('above', 'below', 'no-transform');
  		                if (tooltipModel.yAlign) {
  		                    tooltipEl.classList.add(tooltipModel.yAlign);
  		                } else {
  		                    tooltipEl.classList.add('no-transform');
  		                }

  		                function getBody(bodyItem) {
  		                    return bodyItem.lines;
  		                }

  		                if (tooltipModel.body) {
  		                    var titleLines = tooltipModel.title || [];
  		                    var bodyLines = tooltipModel.body.map(getBody);

  		                    var innerHtml = '';

  		                    // titleLines.forEach(function(title) {
  		                    //     innerHtml += '<tr><th>' + title + '</th></tr>';
  		                    // });
  		                    // innerHtml += '</thead><tbody>';

  		                    bodyLines.forEach(function(body, i) {
  		                        var colors = tooltipModel.labelColors[i];
  		                        var style = 'background:' + colors.backgroundColor;
  		                        style += '; border-color:' + colors.borderColor;
  		                        style += '; border-width: 2px';
  		                        var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
  		                        innerHtml += '<tr><td>' + span + body + '</td></tr>';
  		                    });
  		                    innerHtml += '</tbody>';

  		                    var tableRoot = tooltipEl.querySelector('table');
  		                    tableRoot.innerHTML = innerHtml;
  		                }

  		                // `this` will be the overall tooltip
  		                var position = this._chart.canvas.getBoundingClientRect();

  		                // Display, position, and set styles for font
  		                tooltipEl.style.opacity = 1;
  		                tooltipEl.style.left = position.left + tooltipModel.caretX + 'px';
  		                tooltipEl.style.top = position.top + tooltipModel.caretY + 'px';
  		                tooltipEl.style.fontSize = tooltipModel.fontSize;
  		                tooltipEl.style.fontStyle = tooltipModel._fontStyle;
  		                tooltipEl.style.padding = '5px ' + '10px';
  		            }
  		        },
  		        cutoutPercentage: 30
              }
          })
      }
      */
  } catch (err) {
    console.log('Error ' + err.name + ":" + err.message);
  }
})

// function sidefixleft() {
// 	if ( $('.side-startproject').length) {
// 		$('.side-startproject').height( $(window).height() - $('header').outerHeight() )
// 		$('.side-startproject').sticky('block-affix', {
//             useTransition: false,
//             animate: false,
//             offset: 90
//         })
// 	}
// }

// function sidefix() {
// 	if ( $('.side-menu').length) {
//     	$('.side-menu').sticky('block-affix', {
//             useTransition: false,
//             animate: false,
//             offset: 90
//         })
//     }
// }

function sidefixleft() {
	if (window.matchMedia("(min-width: 992px)").matches) {
		$('.side-startproject').height($(window).height() - $('header').outerHeight())
		$('.side-startproject').sticky({
			topSpacing: 90,
			bottomSpacing: 382
		})
	} else {
		$('.side-startproject').unstick();
	}
}

function sidefix() {
	if (window.matchMedia("(min-width: 992px)").matches) {
		$('.side-menu').sticky({
			topSpacing: 90,
			bottomSpacing: 382
		})
	} else {
		$('.side-menu').unstick();
	}
}

// вызываем окно alert изакрываем его через 3 секунды. Функция схематичная, в качестве примера
/*function alertexample() {
	$('#alert-02').addClass('show')
	setTimeout(function(){
		$('.alerts-popup .alert').each(function() {
			$('#alert-02').alert('close')
		})
	},5000)
}*/