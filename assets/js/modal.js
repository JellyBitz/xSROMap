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

		if(isOpen){
			$('.modal').removeClass('modal--active');
			$('.modal__content').removeClass('modal__content--active');

			var triggers = $('.modal__trigger');
			for (var i = 0; i < triggers.length; i++) {
				triggers[i].style.transform = 'none';
				triggers[i].style.webkitTransform = 'none';
			}
			triggers.removeClass('modal__trigger--active');

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