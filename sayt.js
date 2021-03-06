/*
 * jQuery Search as you Type plugin
 *
 * Website: http://drawne.com
 */
 
(function($) {
	$.fn.sayt	=	function(options) {
		
		// Define default options
		var defaults = {
			inputId: '%-sayt',
			classPrefix: 'sayt-',
			noResultsText: 'No results.',
			inputWidth: $(this).outerWidth()-2,
			minChars: 2,
			showSectionHeadings: false,
			showDescription: true,
			showImages: true,
			includeCSS: true,
			seeAllLink: false
		};
		
		
		var options = $.extend(defaults, options);
		
		
		//Include default stylesheet
		if(options.includeCSS) {
			$('head').append('<link rel="stylesheet" href="sayt.css" type="text/css" />');
		}
		
		
		options.inputId = options.inputId.replace('%', $(this).attr('id'));
		
		
		var prevQuery = '';
		var data;
		
		
		$(this).attr('autocomplete', 'off');
		$(this).after('<ul class="'+options.classPrefix+'box" id="'+options.inputId+'" style="display: none;"></ul>');
		var input = $(this);
		var boxObj = $('#'+options.inputId);
		
		
		
		//Actual function with keyup
		var timeout = null;
		var currentRequest = null;
		var requestCount = 0;
		input.keyup(function(event) {
		
			//only trigger on keystokes
			if (event.which != 13 && event.which != 9 && event.which != 37 && event.which != 38 && event.which != 39 && event.which != 40){
			
				var query = input.val();
				if(query == "" || query.length < options.minChars) {
					//do nothing if min value isn't met
					boxObj.fadeOut(200);
				}else{
					
					prevQuery = query;
					
					//Loading animation, great for adding a whirlywiggy
					input.addClass(options.classPrefix+'thinking');
				
					currentRequest = $.ajax({
						url: options.src+"?query="+query+"&callback=?",
						crossDomain: true, 
						contentType: "application/json",
						dataType: "jsonp",
						data: {
							jsonp: "callback"
						},
						requestCount: ++requestCount,
					    success: function(data) {
							 if (requestCount !== this.requestCount) return;
							 	
							 	var output = "";
							 	
								var resultsExist = false;
								$.each(data, function(i, section) {
									if (section['data'].length > 0)
									{
										resultsExist = true;
									}
								});
								
								if(!resultsExist) {
								
								
								
								}else{
								 	
								 	$.each(data, function(i, section) {
								 	
								 		var num = section['section']['num'];
								 		
								 		if (num != 0){
								 		var limit = section['section']['limit'];
								 		var i = 0;
								 		
								 		if (options.showSectionHeadings && section['section']['title'] != undefined) {
								 			output += '<li class="'+options.classPrefix+'heading">';
								 			output += section['section']['title'];
								 			output += '</li>';
								 		}
								 	
								 		$.each(section['data'], function (ii, item) {
								 		
								 				if (i < limit) {
									 				var haslink = (item['url'] != undefined || item['onclick'] != undefined ) ? true : false;
									 				
									 				var link = (haslink == true ) ? "<a " : "";
									 				if (haslink == true ){
										 				link = "<a "
										 				if(item['url'] != undefined){
										 					link += "href='" + item['url'] + "'"
										 				}
										 				if(item['onclick'] != undefined){
										 					link += "onclick='" + item['onclick'] + "'"
										 				}
										 				link += ">"
									 				
									 				}else{
										 				link = '<div class="no-link">'
									 				}
									 				
										 			var linkclose = (haslink == true ) ? "</a>" : "</div>";
										 	
											 		
										 			output += '<li class="'+options.classPrefix+'result">' + link;
										 			output += '<table border="0" cellspacing="0" cellpadding="0" width="100%"><tr>'
										 			output += (item['image'] != undefined && options.showImages) ? '<td width="68"><img src="'+item['image']+'" class="preview" /></td>' : '';
										 			output += '<td>';
										 			output += '<p class="data">';
										 			output += (item['title'] != undefined) ? '<span class="title">' + item['title'] + '</span><br />\n' : '';
										 			output += (item['description'] != undefined) ? '<span class="description">' + item['description'] + '</span>' : '';
										 			output += '</p>';
										 			output += '</td>';
										 			output += '</tr></table>';
										 			output += linkclose;
										 			output += '</li>';
									 			
									 			}
									 			
									 			i++;
								 		})
								 		
								 		}
								 		
								 	})
								 	
								 	//See all link, basically just submits to the form #sticks&stones
								 	if(options.seeAllLink) {
									 	
												output += '<li class="'+options.classPrefix+'result"><a href="javascript:void(0);" onclick="$(this).closest(\'form\').submit();">';
												output += '<table border="0" cellspacing="0" cellpadding="0" width="100%"><tr>';
												output += '<td>';
												output += '<p class="data">';
												output += '<span class="title">See All Results...</span><br />\n';
												output += '</p>'+"\n";
												output += '</td>';
												output += '</tr></table>';
												output += '</a></li>'+"\n";
									 	
								 	}
								 	
								 	
								 	boxObj.html(output);
								
								 	boxObj.css('width', options.inputWidth);
								 	boxObj.css('position', 'absolute');
									boxObj.css('top', input.offset().top+input.outerHeight());
									boxObj.css('left', input.offset().left);
									
									//remove thinking class
									input.removeClass(options.classPrefix+'thinking');
										 	
								 	boxObj.fadeIn(200);
								 	
								 	
									// use keyboard for selecting results
									var current_index = -1,
										$number_list = $('.'+options.classPrefix+'box'),
										$options = $number_list.find('.'+options.classPrefix+'result'),
										items_total = $options.length;
	
									$options.hover(function() {
										$options.removeClass('selected');
										$(this).addClass('hover selected');
										current_index = $options.index(this);
									}, function() {
										$(this).removeClass('hover selected');
										current_index = -1;
									});
										
									input.bind('keyup', function(e) {
										if (e.which == 40) {
											if (current_index + 1 < items_total) {
												current_index++;
												change_selection();
											}
											input.val(input.val());
											e.preventDefault();
										} else if (e.which == 38) {
											if (current_index > 0) {
												current_index--;
												change_selection();
											}
											input.val(input.val());
											e.preventDefault();
										} else if (e.which == 13) {
											if(!$options.eq(current_index).hasClass('hover') && current_index > -1){
											window.location = $options.eq(current_index).find('a').attr("href");
											e.preventDefault();
											};
										}
									});
									
									function change_selection()
									{
										$options.removeClass('selected');
										$options.removeClass('hover');
										$options.eq(current_index).addClass('selected');
									}
								 	
								 	
							 	}
							 	
								return;
					    },
					    error: function(xhr, textStatus, errorThrown) {
						},
							
						beforeSend : function()
							{
								if(currentRequest != null)
								{
									currentRequest.abort()
									//cannont use in a JSONP request
								}
							}
					});	
					
				}
			};
		});
		
		//show last results if input focused again
		input.focus(function(){
			if (input.val() == prevQuery && input.val() != '') {
				boxObj.fadeIn(200);
			}
		});
		
		//hide search when input if unselected
		input.blur(function() {
			boxObj.fadeOut(0);
		});
		
	}
})(jQuery);