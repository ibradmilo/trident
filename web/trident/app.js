var MILO = {
  data: {},
  serviceUrl:"",
  assets : [],
  frames : [],
  videos : [],
  _video : {},
  zoom:  1,
  x_min : 0,
  x_max : 935,
  x_offset : 0,
  x_last : 0,
  hammer_enabled: 0,
  timer : {},
  timer_counter : 0,
  handle_interaction_tracked : 0,
  handle_trigger_tracked : 0,
  isSafari : 0,
  isAndroidMobile : 0,
  interactionMade : 0,
  selectionMade: false,

  init : function () {
    var navU = navigator.userAgent;
    MILO.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    MILO.isAndroidMobile = (navU.indexOf('Android') > -1 && navU.indexOf('Mozilla/5.0') > -1 && navU.indexOf('AppleWebKit') > -1);

    if(MILO.isAndroidMobile) {
      $('#ad').removeClass('android').addClass('android');
    }

    var layout = MILO.data.steps;

    for (var i = 0; i < layout.length; i++) {
      var new_frame = new advertFrame(layout[i], i);
      new_frame.render();
      MILO.frames.push(new_frame);
    }

    MILO.addFrameListeners();

    var video_data = MILO.data.videos;

    for (var i = 0; i < video_data.length; i++) {
      var new_video = new advertVideo(video_data[i]);

      MILO.videos.push(new_video);
    }

    setTimeout(function() {
      MILO.playFrame('f1')
    }, 1);

   //impression tag

  },

  addFrameListeners : function () {

    $('#ad #f1').bind('onplay', function() {

      var selected_video = MILO.getVideoByID('video_main');
      selected_video.render($('#f1 .video-container'),function() {
        //start video
      },function() {
        $('.video-container > div').removeClass('played').addClass('played')
        var next_frame = MILO.getFrameByID('f2');
        next_frame.play();
      },function() {
        //safari done callback
      },0)

    });

    $('#ad #f2').bind('onplay', function() {

      $('.question-container .t-question').click(function(event) {
        event.preventDefault();
        event.stopPropagation();
        TXM.api.track('other', $(this).text());

        TXM.api.saveVoteData(1, $(this).text(), $(this).attr('data-answer-id'));
        MILO.voteData = TXM.api.getVoteSummary();
        //console.log(MILO.voteData);
        MILO.totalVoteCount = 0;
        $('.t-question').each(function(index){
          var current_id = $(this).attr('data-answer-id');
          var data_objects = _.where(MILO.voteData, {vote: current_id});
          var question_container = $(this).parents('.question-container')
          if (data_objects.length > 0) {
            question_container.attr('data-value',data_objects[0].vote_count)
            MILO.totalVoteCount += parseInt(data_objects[0].vote_count);
          } else {
            MILO.totalVoteCount += parseInt(question_container.attr('data-value'))
          }

        })

        if(!MILO.selectionMade) {
          MILO.selectionMade = true;
          $('.question-container').each(function(index) {
            var question_container_obj = $(this);
            var question_obj = $(this).find('.t-question');
            var percentage = Math.round(parseInt(question_container_obj.attr('data-value')) / MILO.totalVoteCount * 100);

            question_container_obj.find('.circle-result').text(percentage + '%')

            if(question_obj.find('.results').length <= 0) {
              question_obj.prepend('<div class="results">&nbsp;</div>')
              question_obj.find('.results').animate({
                "width": question_obj.width() * percentage / 100
              },500,function() {
                $('.circle-result').removeClass('active').addClass('active')
                setTimeout(function() {
                  var next_frame = MILO.getFrameByID('f3');
                  next_frame.play();
                },3000)
              })
            }

          })


        }
      })

    });

    $('#ad #f3').bind('onplay', function() {

      $('.button-learn-more').click(function(event) {
        event.preventDefault();
        event.stopPropagation();
        TXM.utils.popupWebsite('learn');
      });

      $('.button-calendar').click(function(event) {
        event.preventDefault();
        event.stopPropagation();
        TXM.utils.popupWebsite('calendar');
      });


    });


  },

  setConfig : function (config_obj) {
    if (_.has(config_obj, 'data')) {
      this.data = config_obj.data;
    }

    if (_.has(config_obj, 'serviceUrl')) {
      this.serviceUrl = config_obj.serviceUrl
    }
  },

  preloadAssets : function () {
    _.each(MILO.data.steps, function(step_obj) {
      _.each(step_obj.controls, function(control_obj) {
        var asset_url = MILO.serviceUrl + 'assets/' + control_obj.name;
                $("<img />").attr("src", asset_url);
                MILO.assets.push(asset_url);
      })
    })

    if (_.has(MILO.data, 'additional_assets')) {
      _.each(MILO.data.additional_assets, function(asset_obj){
        var asset_url = MILO.serviceUrl + 'assets/' + asset_obj;
        $("<img />").attr("src", asset_url);
        MILO.assets.push(asset_url);
      })
    }

    /*
    WebFontConfig = {
      google: { families: [ ] }
    };
     (function() {
      var wf = document.createElement('script');
      wf.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
      wf.type = 'text/javascript';
      wf.async = 'true';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(wf, s);
          })();
    */
  },

  playFrame: function(id)
  {
    selected_frame = MILO.getFrameByID(id);
    selected_frame.play();
  },

  getFrameByID: function(id) {
    var selected_frame = _.where(MILO.frames, {id: id});

    if (selected_frame.length) {
      return selected_frame[0];
    } else {
      return {}
    }

  },

  renderVideo:function (video_id, container_obj, callback) {
    selected_video = MILO.getVideoByID(video_id);
    selected_video.render(container_obj, callback);
  },

  getVideoByID:function (id) {
    var selected_obj = _.where(MILO.videos, {id: id});
    if (selected_obj.length) {
      return selected_obj[0];
    } else {
      return {};
    }
  },

  stopVideos: function () {
    $('video').each(function(index) {
      $(this).get(0).pause();
    })
  },

  impressionTag: function (url) {
    var random_number = Math.floor((Math.random() * 10000) + 1);
    TXM.utils.loadExternalTracking(url + random_number);
  },

  loadScreen: function(target_selector, template_path, context, callback) {

    jqxhr = $.ajax({
      type: "GET",
      url: MILO.serviceUrl + template_path,
      cache: false
    }).done(function(data) {
      source    = data;
      template  = Handlebars.compile(source)
      html = template(context)

      target = $(target_selector)
      target.empty()
      target.html(html)

      callback()

    }).fail(function(data) {
      window.console.log("Request failed.");
      //window.console.log(data);
    });

  }

}