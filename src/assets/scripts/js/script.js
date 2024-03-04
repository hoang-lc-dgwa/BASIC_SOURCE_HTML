(function ($) {
  "use strict";
  const $loadingElement = $("#loading");
  const $pageMain = $(".page-main");

  function scrollAnimation() {
    inView.offset({
      top: 0,
      right: 0,
      bottom: 100,
      left: 0,
    });
    inView(".js-effect, .js-anm-mask, .js-fade").on("enter", function (el) {
      el.classList.add("is-show");
    });
  }

  function hideLoadingScreen() {
    $loadingElement.addClass("is-hidden");
    setTimeout(function () {
      scrollAnimation();
      $("body").removeClass("is-fixed");
    }, 500);
  }

  function loadingScreen() {
    if ($loadingElement.length) {
      $("body").addClass("is-fixed");
      if (!sessionStorage.getItem("loaded")) {
        $(window).on("load", function () {
          hideLoadingScreen();
          sessionStorage.setItem("loaded", "true");
        });
      } else {
        hideLoadingScreen();
      }
    } else {
      setTimeout(() => {
        scrollAnimation();
      }, 500);
    }
  }

  function setFillHeightVh() {
    const setVh = function () {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    $(window).on("load resize", setVh);
  }

  function btnScrollTop() {
    const $pageTopBtn = $(".js-pagetop");
    const scrollTarget = $(window).height();

    $(window).on("load scroll touchmove", function () {
      const scrollTop = $(window).scrollTop();

      if (scrollTop > scrollTarget) {
        $pageTopBtn.addClass("is-active");
      } else {
        $pageTopBtn.removeClass("is-active");
      }
    });

    $pageTopBtn.on("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    });
  }

  function initAccordion() {
    var _scope_ = null;
    var btnEl = [".js-accordion-btn"];

    btnEl.forEach(function (element) {
      $(element, _scope_).each(function () {
        if (!$(this).hasClass("is-active")) {
          $(this).next().hide();
        }
        $(this).click(function () {
          $(this).toggleClass("is-active");
          $(this).next().slideToggle("fast");
        });
      });
    });
  }

  function initModal() {
    let current = "";

    function openModal(_id) {
      current = _id;
      $(current).addClass("is-show");
      $("body").addClass("is-modal-open");
    }

    function closeModal() {
      $(current).removeClass("is-show");
      $("body").removeClass("is-modal-open");
    }

    $(".js-modal-btn").on("click", function (e) {
      openModal($(this).data("modal"));
      e.preventDefault();
    });

    $(".js-modal-close").on("click", function () {
      closeModal();
    });

    $(".js-modal-overlay").on("click", function (e) {
      if ($(e.target).hasClass("js-modal-overlay")) {
        closeModal();
      }
    });

    $(document).on("keydown", function (e) {
      if (e.key === "Escape" || e.key === "Esc") {
        closeModal();
      }
    });
  }

  function initTabs() {
    $(".js-tabs-content").removeClass("is-current");

    $(".js-tabs-btn").click(function () {
      const $tabsWrap = $(this).closest(".js-tabs-wrap");
      $tabsWrap.find(".js-tabs-btn").removeClass("is-current");
      $(this).addClass("is-current");
      const tabName = $(this).data("tabs");
      $tabsWrap.find(".js-tabs-content").removeClass("is-current");
      $("#" + tabName).addClass("is-current");
    });

    $(".js-tabs-btn.is-current").trigger("click");
  }

  function showPageMain() {
    setTimeout(() => {
      $pageMain.addClass("is-show");
    }, 500);
  }

  function initMatchHeight() {
    $(".js-matchHeight").matchHeight();
  }

  //--- init
  //------------
  $(function () {
    loadingScreen();
    setFillHeightVh();
    btnScrollTop();
    initAccordion();
    initModal();
    initTabs();
    showPageMain();
    initMatchHeight();
  });
})(jQuery);
