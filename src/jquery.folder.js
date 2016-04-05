// Folder jQuery Plugin
// A jQuery folder plugin

(function($) {
    var Folder = function(element, options) {
        this.folderGroup = $(element);

        this.config = $.extend({
            animation: 'linear',
            animationDuration: 400,
            openFirstFolder: true,
            ariaTextClass: 'aria-text',
            singleOpen: true,
            forceOpenClass: 'is-default-open',
            folderGroupClass: 'folder-group',
            folderTriggerClass: 'folder-trigger',
            folderContentClass: 'folder-content',
            ariaTextOpen: 'Cliquer pour ouvrir',
            ariaTextClose: 'Cliquer pour fermer',
            onFocus: $.noop,
            beforeOpen: $.noop,
            afterOpen: $.noop,
            beforeClose: $.noop,
            afterClose: $.noop,
            onBlur: $.noop,
            customGlobalClasses: {}
        }, options || {});

        this.classes = $.extend({
            active: 'is-active',
            open: 'is-open',
            hover: 'is-hover',
            clicked: 'is-clicked',
            extern: 'is-external',
            error: 'is-error'
        }, this.config.customGlobalClasses || {});

        // Get all the folders
        this.folders = this.folderGroup.find('.folder');

        // Get all the folders triggers and transform them into <button> tag
        this.folderGroup.find('.' + this.config.folderTriggerClass).buttonize({
            a11y: this.config.a11y
        });

        // Get all the folders triggers
        this.folderTriggers = this.folderGroup.find('.' + this.config.folderTriggerClass);

        // Get all the folders contents
        this.folderContents = this.folderGroup.find('.' + this.config.folderContentClass);

        // Create and get the aria text for all folders triggers
        this.folderTriggers.append('<span class="' + this.config.ariaTextClass + ' visuallyhidden"></span>');
        this.folderArias = this.folderTriggers.find('.' + this.config.ariaTextClass);

        this.init();
    };

    $.extend(Folder.prototype, {
        // Component initialization
        init: function() {
            this.bindEvents();
            // Check if each element has to be open or close
            this.folders.each($.proxy(function(index, element) {
                var $element = $(element);
                // Find elements of current tab
                currentAriaContainer = $element.find('.' + this.config.ariaTextClass);
                currentContent = $element.find('.' + this.config.folderContentClass);
                // If has force open class or not
                if (!$element.hasClass(this.config.forceOpenClass)) {
                    currentContent.hide();
                    this.changeAriaText(currentAriaContainer, this.config.ariaTextOpen);
                } else {
                    $element.addClass(this.classes.active);
                    this.changeAriaText(currentAriaContainer, this.config.ariaTextClose);
                }
            }, this));
            // If first folder has to be open
            if (this.config.openFirstFolder) {
                this.openFirstFolder();
            }
        },

        // Bind events with actions
        bindEvents: function() {
            // Folder trigger click event (open or close)
            this.folderTriggers.on('click', $.proxy(function(e) {
                // If folder is opened or not
                if ($(e.currentTarget).parent().hasClass(this.classes.active)) {
                    this.closeFolder($(e.currentTarget));
                } else {
                    this.openFolder($(e.currentTarget));
                }
            }, this));

            // On blur and focuse change aria-live value
            this.folderTriggers.on('focus', $.proxy(function(e) {
                this.onTriggerFocus($(e.currentTarget));
            }, this));
            this.folderTriggers.on('blur', $.proxy(function(e) {
                this.onTriggerBlur($(e.currentTarget));
            }, this));
            // On blur and focuse custom config function call
            this.folderTriggers.on('focus', this.config.onFocus);
            this.folderTriggers.on('blur', this.config.onBlur);
        },

        // Open the current folder
        openFolder: function(currentTrigger) {
            // Custom config function call
            this.config.beforeOpen();
            // Find elements of current tab
            currentAriaContainer = currentTrigger.find('.' + this.config.ariaTextClass);
            currentFolder = currentTrigger.parent();
            currentContent = currentFolder.find('.' + this.config.folderContentClass);

            // With animation
            if (this.config.animation !== 'none') {
                // If singleopen option set to true close every folders
                if (this.config.singleOpen == true) {
                    this.folderContents.slideUp(this.config.animationDuration);
                    this.folders.removeClass(this.classes.active);
                    this.changeAriaText(this.folderArias, this.config.ariaTextOpen);
                }
                currentContent.slideDown(this.config.animationDuration, $.proxy(function() {
                    currentFolder.addClass(this.classes.active);
                    // Custom config function call
                    this.config.afterOpen();
                }, this));
            }
            // Without animation
            else {
                // If singleopen option set to true close every folders
                if (this.config.singleOpen == true) {
                    this.folderContents.hide();
                    this.folders.removeClass(this.classes.active)
                    this.changeAriaText(this.folderArias, this.config.ariaTextOpen);
                }
                currentContent.show();
                currentFolder.addClass(this.classes.active);
                // Custom config function call
                this.config.afterOpen();
            }
            this.changeAriaText(currentAriaContainer, this.config.ariaTextClose);
        },

        // Close the current folder
        closeFolder: function(currentTrigger) {
            // Custom config function call
            this.config.beforeClose();
            // Find elements of current tab
            currentAriaContainer = currentTrigger.find('.' + this.config.ariaTextClass);
            currentFolder = currentTrigger.parent();
            currentContent = currentFolder.find('.' + this.config.folderContentClass);

            // With animation
            if (this.config.animation !== 'none') {
                currentContent.slideUp(this.config.animationDuration, $.proxy(function() {
                    currentFolder.removeClass(this.classes.active);
                    // Custom config function call
                    this.config.afterClose();
                }, this));
            }
            // Without animation
            else {
                currentContent.hide();
                currentFolder.removeClass(this.classes.active);
                // Custom config function call
                this.config.afterClose();
            }
            this.changeAriaText(currentAriaContainer, this.config.ariaTextOpen);
        },

        // Open first folder
        openFirstFolder: function() {
            var firstFolder = this.folders.first();
            firstFolder.find('.' + this.config.folderContentClass).show();
            firstFolder.addClass(this.classes.active);
            this.changeAriaText(firstFolder.find('.' + this.config.ariaTextClass), this.config.ariaTextClose);
        },

        // Change aria text of a folder
        changeAriaText: function(element, ariaText) {
            element.text(ariaText);
        },

        // Change aria-live attribute on focus
        onTriggerFocus: function(trigger) {
            trigger.find('.' + this.config.ariaTextClass).attr('aria-live', 'polite');
        },

        // Change aria-live attribute on blur
        onTriggerBlur: function(trigger) {
            trigger.find('.' + this.config.ariaTextClass).removeAttr('aria-live');
        }
    });

    $.fn.folder = function(options) {
        return this.each(function() {
            var element = $(this);

            // Return early if this element already has a plugin instance
            if (element.data('folder')) return;

            // pass options to plugin constructor
            var folder = new Folder(this, options);

            // Store plugin object in this element's data
            element.data('folder', folder);
        });
    };
})(jQuery);
