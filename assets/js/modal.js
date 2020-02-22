var Modal = (function() {
	var isOpen = false;

	var show = function(id){
		var modal = $('#'+id);
		if (!isOpen && modal.length) {
			// reveal the modal
			modal.addClass('modal--active');
			// reveal the modal content
			modal.find('.modal__content').addClass('modal__content--active');

			isOpen = true;
		}
	};
	var onTrigger = function(e) {
		e.preventDefault();
		show(this.dataset.modal);
	};
	var onClosing = function(e) {
		e.preventDefault();
		e.stopImmediatePropagation();

		var target = $(e.target);

		if(isOpen && (target.hasClass('modal__bg') || target.hasClass("modal__close") || target.parent().hasClass("modal__close"))){
			$('.modal').removeClass('modal--active');
			$('.modal__content').removeClass('modal__content--active');
			isOpen = false;
		}
  };
  var initEvents = function() {
		$('.modal__trigger').click(onTrigger);
		$('.modal__close').click(onClosing); // closing button
		$('.modal__bg').click(onClosing); // darker background
  };
  return {
    init:function(){
  		initEvents();
    }
  };
}());
Modal.init();